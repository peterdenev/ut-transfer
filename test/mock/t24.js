const getAmount = require('../../currency').amount;

module.exports = {
    id: 't24-mock',
    createPort: require('ut-port-script'),
    logLevel: 'trace',
    namespace: ['t24/transfer'],
    'transfer.push.execute': function(msg) {
        let amount = 10000000;
        let balance = {
            ledger: getAmount(msg.transferCurrency, amount),
            available: getAmount(msg.transferCurrency, amount)
        };

        return {balance, transferIdIssuer: msg.issuerId};
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
