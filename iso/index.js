var currency = require('./currency');

function getBalance(field, balanceType) {
    var balance = field.match(/.{20}/g).find(value => value.substr(2, 2) === balanceType);
    if (balance) {
        var sign = 0;
        switch (balance.substr(7, 1)) {
            case 'c':
            case 'C':
                sign = 1;
                break;
            case 'd':
            case 'D':
                sign = -1;
        }
        return currency.cents(balance.substr(4, 3), balance.substr(8, 12), sign);
    }
}

module.exports = {
    toISO: function(version, msg) {
        if (version === 0) {
            return {
                mtid: '0200',
                '2': msg.udfAcquirer && msg.udfAcquirer.card,
                '3': msg.udfAcquirer && msg.udfAcquirer.processingCode,
                '4': msg.amount && msg.amount.transfer && msg.amount.transfer.cents,
                '7': msg.localDateTime && msg.localDateTime.slice(-10),
                '12': msg.localDateTime && msg.localDateTime.slice(-6),
                '13': msg.localDateTime && msg.localDateTime.slice(-10).substring(0, 4),
                // todo 15
                '18': msg.udfAcquirer && msg.udfAcquirer.merchantType,
                '32': msg.udfAcquirer && msg.udfAcquirer.institutionCode,
                '35': msg.udfAcquirer && msg.udfAcquirer.track2,
                '37': msg.transferId,
                '41': msg.udfAcquirer && msg.udfAcquirer.terminalId,
                '42': msg.udfAcquirer && msg.udfAcquirer.identificationCode,
                '43': msg.udfAcquirer && msg.udfAcquirer.terminalName,
                '49': currency.numeric(msg.transferCurrency),
                // todo 52
                '102': msg.sourceAccount,
                '103': msg.destinationAccount,
                '122': msg.merchantId,
                '123': msg.merchantInvoice
            };
        }
    },
    fromISO: function(msg, $meta) {
        if ($meta.mtid === 'error') {
            switch (msg[39]) {
                case '14':
                case '39':
                case '114':
                    return {
                        type: 'transfer.invalidAccount'
                    };
                case '51':
                case '116':
                    return {
                        type: 'transfer.insufficientFunds'
                    };
                case '55':
                case '117':
                    return {
                        type: 'transfer.incorrectPin'
                    };
                case '68':
                case '96':
                case '909':
                case '911':
                    return {
                        type: 'transfer.unknown'
                    };
                default:
                    return {
                        type: 'transfer.genericDecline'
                    };
            }
        }
        switch (msg.mtid) {
            case '0210':
                return {
                    balance: {
                        ledger: getBalance(msg[54], '01'),
                        available: getBalance(msg[54], '02')
                    },
                    transferIdIssuer: msg[38]
                };
        }
    }
};
