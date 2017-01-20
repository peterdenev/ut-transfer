const DECLINED = {
    issuer: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    merchant: ['merchant.genericDecline']
};
var errors = require('../../errors');

module.exports = {
    'push.execute': function(params) {
        var handleError = (transfer, where) => error => {
            var method;
            if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
                method = this.bus.importMethod('db/transfer.push.fail' + where);
            } else {
                method = this.bus.importMethod('db/transfer.push.reverse' + where);
            }
            return method({
                transferId: transfer.transferId,
                source: where,
                type: error.type || (where + '.error'),
                message: error.message,
                details: error
            })
            .then(x => Promise.reject(error))
            .catch(x => {
                this.log.error && this.log.error(error);
                return Promise.reject(error);
            });
        };
        var ruleValidate = (transfer) => this.bus.importMethod('db/rule.decision.lookup')({
            channelId: transfer.channelId,
            operation: transfer.transferType,
            sourceAccount: transfer.sourceAccount,
            destinationAccount: transfer.destinationAccount,
            amount: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount,
            currency: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency,
            isSourceAmount: false
        }).then(decision => {
            if (decision.amount) {
                transfer.transferFee = decision.amount.acquirerFee + decision.amount.issuerFee;
                transfer.acquirerFee = decision.amount.acquirerFee;
                transfer.issuerFee = decision.amount.issuerFee;
            }
            transfer.transferDateTime = decision.amount && decision.amount.transferDateTime;
            transfer.transferTypeId = decision.amount && decision.amount.transferTypeId;
            transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
            transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
            transfer.split = decision.split;
            return transfer;
        });
        var dbPushExecute = transfer => this.bus.importMethod('db/transfer.push.execute')(transfer)
            .then(pushResult => {
                pushResult = pushResult && pushResult[0] && pushResult[0][0];
                if (pushResult && pushResult.transferId) {
                    transfer.transferId = pushResult.transferId;
                    transfer.merchantPort = pushResult.merchantPort;
                    transfer.destinationPort = pushResult.destinationPort;
                    transfer.destinationSettlementDate = pushResult.destinationSettlementDate;
                    transfer.localDateTime = pushResult.localDateTime;
                    return transfer;
                } else {
                    throw errors.system('transfer.push.execute');
                }
            });
        var merchantTransferValidate = (transfer) => {
            if (transfer.merchantPort) {
                return this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'validate'].join('.'))(transfer)
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };
        var destinationPushExecute = (transfer) => {
            if (transfer.destinationPort) {
                return this.bus.importMethod('db/transfer.push.requestIssuer')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod(transfer.destinationPort + '/transfer.push.execute'))
                    .then(result => {
                        transfer.balance = result.balance;
                        transfer.transferIdIssuer = result.transferIdIssuer;
                        return transfer;
                    })
                    .catch(handleError(transfer, 'Issuer'));
            } else {
                return transfer;
            }
        };
        var confirmIssuer = (transfer) => this.bus.importMethod('db/transfer.push.confirmIssuer')(transfer)
            .then(() => transfer);
        var merchantTransferExecute = (transfer) => {
            if (transfer.merchantPort) {
                return this.bus.importMethod('db/transfer.push.requestMerchant')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'execute'].join('.')))
                    .then(merchantResult => {
                        transfer.transferIdMerchant = merchantResult.transferIdMerchant;
                        return {
                            transferId: transfer.transferId,
                            transferIdMerchant: transfer.transferIdMerchant
                        };
                    })
                    .then(this.bus.importMethod('db/transfer.push.confirmMerchant'))
                    .then(() => transfer)
                    .catch(handleError(transfer, 'Merchant'));
            } else {
                return transfer;
            }
        };

        return ruleValidate(params)
            .then(dbPushExecute)
            .then(merchantTransferValidate)
            .then(destinationPushExecute)
            .then(confirmIssuer)
            .then(merchantTransferExecute);
    }
};
// todo handle timeout from destination port
