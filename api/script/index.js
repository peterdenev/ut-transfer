const DECLINED = {
    issuer: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    merchant: ['merchant.genericDecline']
};
var errors = require('../../errors');

module.exports = {
    'push.execute': function(msg) {
        msg.transferAmount = msg.amount && msg.amount.transfer && msg.amount.transfer.amount;
        msg.transferCurrency = msg.amount && msg.amount.transfer && msg.amount.transfer.currency;

        var handleError = (where) => error => {
            var method;
            if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
                method = this.bus.importMethod('db/transfer.push.fail' + where);
            } else {
                method = this.bus.importMethod('db/transfer.push.reverse' + where);
            }
            return method(msg)
                .then(x => Promise.reject(error))
                .catch(x => {
                    this.log.error && this.log.error(error);
                    return Promise.reject(error);
                });
        };

        var ruleValidate = (result) => {
            debugger;
            return this.bus.importMethod('db/rule.decision.lookup')({
                channelId: msg.channelId,
                operation: msg.transferType,
                // operationDate: msg.transferDateTime,
                sourceAccount: msg.sourceAccount,
                destinationAccount: msg.destinationAccount,
                amount: msg.amount && msg.amount.transfer && msg.amount.transfer.amount,
                currency: msg.amount && msg.amount.transfer && msg.amount.transfer.currency,
                isSourceAmount: false
            }).then(decision => {
                return result;
            });
        };

        var merchantValidate = result => result;
        var merchantExecute = result => result;
        var destinationExecute = result => result;

        return this.bus.importMethod('db/transfer.push.execute')({
            transfer: msg
        })
        .then(result => {
            result = result && result[0] && result[0][0];
            if (result) {
                msg.transferId = result.transferId;
                msg.merchantPort = result.merchantPort;
                msg.destinationPort = result.destinationPort;
                msg.transferDateTime = result.transferDateTime;
                if (msg.destinatoinPort) {
                    destinationExecute = result => this.bus.importMethod(msg.destinationPort + '/transfer.push.execute')(msg)
                            .then(result => {
                                msg.balance = result.balance;
                                msg.transferIdIssuer = result.transferIdIssuer;
                                return msg;
                            })
                            .catch(handleError('Issuer'));
                }
                if (msg.merchantPort) {
                    merchantValidate = result => this.bus.importMethod([msg.merchantPort, msg.transferType, 'validate'].join('.'))(msg);
                    merchantExecute = result => this.bus.importMethod([msg.merchantPort, msg.transferType, 'execute'].join('.'))(msg)
                        .then(merchantResult => {
                            msg.transferIdMerchant = merchantResult.transferIdMerchant;
                            return msg;
                        })
                        .then(this.bus.importMethod('db/transfer.push.confirmMerchant'))
                        .catch(handleError('Merchant'));
                }
                return msg;
            } else {
                throw errors.system('transfer.push.execute');
            }
        })
        .then(result => ruleValidate(result))
        .then(result => merchantValidate(result))
        .then(result => destinationExecute(result))
        .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
        .then(result => merchantExecute(result))
        .then(result => msg);
    }
};
// todo optimize when issuerTxState is set to 1
// todo handle bad response from db/transfer.push.execute
// todo handle timeout from destination port
// todo set merchantTxState before requesting merchant
// todo set merchantPort properly
// todo call rule
