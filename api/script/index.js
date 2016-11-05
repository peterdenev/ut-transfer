module.exports = {
    'push.execute': function(msg) {
        return this.bus.importMethod('db/transfer.push.execute')({
            transfer: msg
        })
        .then(result => result && result[0] && result[0][0])
        .then(result => {
            msg.transferId = result.transferId;
            var port = (result && result.destinationPort);
            return this.bus.importMethod(port + '/transfer.push.execute')(result);
        })
        .then(result => {
            msg.ledgerBalance = result.ledgerBalance;
            msg.availableBalance = result.availableBalance;
            msg.transferIdIssuer = result.transferIdIssuer;
            return msg;
        })
        .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
        .then(result => msg);
    }
};
// todo optimize when issuerTxState is set to 1
// todo handle bad response from db/transfer.push.execute
