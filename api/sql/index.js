var path = require('path');

module.exports = {
    schema: [{path: path.join(__dirname, 'schema'), linkSP: true}],
    'report.transfer.request.send': function(msg, $meta) {
        if (msg.cardNumber) {
            return this.bus.importMethod('pan.number.encrypt')({card: msg.cardNumber})
                .then((card) => {
                    return Object.assign(msg, {cardNumber: (card.pan || '')});
                });
        }

        return msg;
    }
};
