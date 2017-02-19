const DECLINED = {
    issuer: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    merchant: ['merchant.genericDecline']
};
var errors = require('../../errors');
var currency = require('../../currency');

var processReversal = (bus, log) => params => {
    var transferId;

    var destinationReversal = reversal => {
        reversal = reversal && reversal[0] && reversal[0][0];
        if (reversal) {
            transferId = reversal.transferId;
            reversal.udfAcquirer && (reversal.udfAcquirer.mti = reversal.mti);
            reversal.amount = {
                transfer: currency.amount(reversal.transferCurrency, reversal.transferAmount)
            };
        }
        return reversal && bus.importMethod(`${reversal.destinationPort}/transfer.${reversal.transferType}.${reversal.operation}`)(reversal);
    };

    var confirmReversal = reversalResult => {
        return transferId && bus.importMethod('db/transfer.push.confirmReversal')({
            transferId
        });
    };

    var failReversal = reversalError => {
        return Promise.resolve(transferId && bus.importMethod('db/transfer.push.failReversal')({
            transferId,
            type: reversalError.type || ('issuer.error'),
            message: reversalError.message,
            details: reversalError
        }))
        .catch(error => {
            log.error && log.error(error);
            return Promise.reject(reversalError);
        })// .this is intentionally after catch as we do not want to log the reversalError
        .then(() => {
            return Promise.reject(reversalError);
        });
    };

    return Promise.resolve(params)
        .then(destinationReversal)
        .then(confirmReversal)
        .catch(failReversal);
};

module.exports = {
    'push.execute': function(params) {
        var handleError = (transfer, where) => error => {
            var method;
            if (where === 'Acquirer') {
                method = this.bus.importMethod('db/transfer.push.abortAcquirer');
            } else if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
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
            .catch(x => {
                this.log.error && this.log.error(x);
                return Promise.reject(error);
            }) // .this is intentionally after catch as we do not want to this.log the original error
            .then(x => Promise.reject(error));
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
            transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
            transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
            if (decision.amount) {
                transfer.transferFee = decision.amount.acquirerFee + decision.amount.issuerFee;
                transfer.acquirerFee = decision.amount.acquirerFee;
                transfer.issuerFee = decision.amount.issuerFee;
                transfer.amount.acquirerFee = currency.amount(transfer.transferCurrency, transfer.acquirerFee);
                transfer.amount.issuerFee = currency.amount(transfer.transferCurrency, transfer.issuerFee);
            }
            transfer.transferDateTime = decision.amount && decision.amount.transferDateTime;
            transfer.transferTypeId = decision.amount && decision.amount.transferTypeId;
            transfer.split = decision.split;
            return transfer;
        })
        .catch(error => {
            transfer.abortAcquirer = error;
            transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
            transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
            return this.bus.importMethod('db/rule.operation.lookup')({operation: transfer.transferType})
                .then(result => {
                    transfer.transferDateTime = result && result.operation && result.operation.transferDateTime;
                    transfer.transferTypeId = result && result.operation && result.operation.transferTypeId;
                    return transfer;
                });
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
                    if (transfer.abortAcquirer) {
                        return handleError(transfer, 'Acquirer')(transfer.abortAcquirer);
                    } else {
                        return transfer;
                    }
                } else {
                    throw errors.systemDecline('transfer.push.execute');
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

        function canSkip(transfer) {
            return (transfer.transferType === 'changePin') && transfer.issuerFee === 0;
        }

        var destinationPushExecute = (transfer) => {
            if (transfer.destinationPort && !canSkip(transfer)) {
                return this.bus.importMethod('db/transfer.push.requestIssuer')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod(transfer.destinationPort + '/transfer.push.execute'))
                    .then(result => {
                        transfer.balance = result.balance;
                        transfer.transferIdIssuer = result.transferIdIssuer;
                        return transfer;
                    })
                    .catch(handleError(transfer, 'Issuer'))
                    .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };
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
                    .catch(handleError(transfer, 'Merchant'))
                    .then(this.bus.importMethod('db/transfer.push.confirmMerchant'))
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };

        return ruleValidate(params)
            .then(dbPushExecute)
            .then(merchantTransferValidate)
            .then(destinationPushExecute)
            .then(merchantTransferExecute);
    },
    'idle.execute': function(params, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('db/transfer.idle.execute')(params)
            .then(processReversal(this.bus, this.log));
    },
    'push.reverse': function(params) {
        return this.bus.importMethod('db/transfer.push.getByAcquirer')(params)
            .then(result => {
                if (!result || !result[0] || !result[0][0]) {
                    throw errors.notFound();
                } else {
                    return result;
                }
            })
            .then(processReversal(this.bus, this.log));
    },
    'card.execute': function(params) {
        if (params.abortAcquirer) {
            return this.bus.importMethod('transfer.push.execute')(params);
        } else {
            return this.bus.importMethod('db/atm.card.check')({
                cardId: params.cardId,
                sourceAccount: params.sourceAccount,
                sourceAccountType: params.sourceAccountType,
                destinationType: params.destinationType,
                destinationTypeId: params.destinationTypeId,
                destinationAccount: params.destinationAccount,
                destinationAccountType: params.destinationAccountType,
                pinOffset: params.pinOffset,
                pinOffsetNew: params.pinOffsetNew,
                mode: params.mode
            })
            .catch(error => {
                params.abortAcquirer = error;
                return this.bus.importMethod('transfer.push.execute')(params);
            })
            .then(result => Object.assign(params, {
                sourceAccount: result.sourceAccountNumber,
                sourceAccountName: result.sourceAccountName,
                destinationAccount: result.destinationAccountNumber,
                destinationAccountName: result.destinationAccountName,
                destinationId: result.issuerId,
                cardNumber: result.cardNumber,
                ordererId: result.ordererId
            }))
            .then(result => !params.transferIdAcquirer && this.bus.importMethod(`db/${params.channelType}.terminal.nextId`)({
                channelId: result.channelId
            }))
            .then(result => {
                if (params.transferIdAcquirer) {
                    return params;
                }
                if (!result || !result[0] || !result[0][0] || !result[0][0].tsn) {
                    throw errors.nextId();
                }
                params.transferIdAcquirer = result[0][0].tsn;
                return params;
            })
            .then(this.bus.importMethod('transfer.push.execute'));
        }
    }
};
// todo handle timeout from destination port
