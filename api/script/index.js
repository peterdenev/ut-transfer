const DECLINED = ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'];
const STATES = {
    '1': 'requested',
    '2': 'confirmed',
    '3': 'denied',
    '4': 'timed out',
    '5': 'aborted',
    '6': 'error',
    '7': 'store requested',
    '8': 'store confirmed',
    '9': 'store timed out',
    '11': 'forward requested',
    '12': 'forward confirmed',
    '13': 'forward denied',
    '14': 'forward timed out'
};
STATES;

module.exports = {
    'push.execute': function(msg) {
        msg.transferAmount = msg.amount && msg.amount.transfer && msg.amount.transfer.amount;
        msg.transferCurrency = msg.amount && msg.amount.transfer && msg.amount.transfer.currency;
        return this.bus.importMethod('db/transfer.push.execute')({
            transfer: msg
        })
        .then(result => result && result[0] && result[0][0])
        .then(result => {
            msg.transferId = result.transferId;
            var port = (result && result.destinationPort);
            return this.bus.importMethod(port + '/transfer.push.execute')(result)
                .catch(error => {
                    var method;
                    if (DECLINED.includes(error && error.type)) {
                        method = this.bus.importMethod('db/transfer.push.failIssuer');
                    } else {
                        method = this.bus.importMethod('db/transfer.push.reverseIssuer');
                    }
                    return method(msg)
                        .then(x => Promise.reject(error))
                        .catch(x => Promise.reject(error));
                });
        })
        .then(result => {
            msg.balance = result.balance;
            msg.transferIdIssuer = result.transferIdIssuer;
            return msg;
        })
        .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
        .then(result => {
            var port = (result && result.merchantPort);
            if (!port) {
                return result;
            }
            return this.bus.importMethod([port, msg.transferType, 'execute'].join('.'))(result)
                .then(merchantResult => {
                    msg.transferIdMerchant = merchantResult.transferIdMerchant;
                    return msg;
                })
                .then(this.bus.importMethod('db/transfer.push.confirmMerchant'))
                .catch(error => {
                    this.bus.importMethod('db/transfer.push.failMerchant')(msg)
                        .then(x => Promise.reject(error))
                        .catch(x => Promise.reject(error));
                });
        })
        .then(result => msg);
    }
};
// todo optimize when issuerTxState is set to 1
// todo handle bad response from db/transfer.push.execute
// todo handle timeout from destination port
// todo handle known errors from destination port
// todo handle unknown errors from destination port
