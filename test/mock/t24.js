const getAmount = require('../../currency')().amount;

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
                'transfer.push.execute': function(msg) {
                    switch (msg.sourceAccount) {
                        case '10001000000010007':
                            throw this.errors.getError('transfer.insufficientFunds')();
                        case 2:
                            break;
                        default:
                            let amount = 10000000;
                            let balance = {
                                ledger: getAmount(msg.transferCurrency, amount),
                                available: getAmount(msg.transferCurrency, amount)
                            };

                            return {balance, transferIdIssuer: msg.issuerId};
                    };
                },
                'transfer.push.reverse': function(msg) {
                    return {
                        balance: 10000000,
                        udfIssuer: {
                            acquirerFee: 0,
                            issuerFee: 0,
                            processorFee: 0
                        }
                    };
                },
                'transfer.push.adjust': function(msg) {
                    return {
                        balance: 10000000,
                        udfIssuer: {
                            acquirerFee: 0,
                            issuerFee: 0,
                            processorFee: 0
                        }
                    };
                },
                'transfer.push.confirmIssuer': function(msg) {
                    return msg;
                },
                'transfer.push.confirmMerchant': function(msg) {
                    return msg;
                },
                'transfer.push.failMerchant': function(msg) {
                    return msg;
                }
            };
        };
    };
};
