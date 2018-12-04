const getAmount = require('../../currency').amount;

module.exports = function t24Mock({config}) {
    return config && class t24Mock extends require('ut-port-script')(...arguments) {
        get defaults() {
            return {
                logLevel: 'trace',
                namespace: ['t24/transfer']
            };
        }
        handlers() {
            return {
                'transfer.push.execute': msg => {
                    let amount = 10000000;
                    let balance = {
                        ledger: getAmount(msg.transferCurrency, amount),
                        available: getAmount(msg.transferCurrency, amount)
                    };

                    return {balance, transferIdIssuer: msg.issuerId};
                },
                'transfer.push.confirmIssuer': msg => {
                    return msg;
                },
                'transfer.push.confirmMerchant': msg => {
                    return msg;
                },
                'transfer.push.failMerchant': msg => {
                    return msg;
                }
            };
        }
    };
};
