var currency = require('../currency');
var errors = require('../errors');
var transferType = require('./transferType');

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

function getISOBalance(accountType, ledgerBalance, availableBalance) {
    return `${accountType}01${currency.numeric(ledgerBalance.currency)}${ledgerBalance.cents < 0 ? 'D' : 'C'}${('000000000000' + Math.abs(ledgerBalance.cents)).slice(-12)}` +
        `${accountType}02${currency.numeric(availableBalance.currency)}${availableBalance.cents < 0 ? 'D' : 'C'}${('000000000000' + Math.abs(availableBalance.cents)).slice(-12)}`;
}

module.exports = {
    toISO: function(version, {udfAcquirer, amount, localDateTime, destinationSettlementDate, transferId, transferCurrency, pinBlock, sourceAccount,
        destinationAccount, merchantId, merchantInvoice, balance, accountType}) {
        function base() {
            if (version === 0) {
                return {
                    '2': udfAcquirer && udfAcquirer.card,
                    '3': udfAcquirer && udfAcquirer.processingCode,
                    '4': amount && amount.transfer && amount.transfer.cents,
                    '7': localDateTime && localDateTime.slice(-10),
                    '12': localDateTime && localDateTime.slice(-6),
                    '13': localDateTime && localDateTime.slice(-10).substring(0, 4),
                    '15': destinationSettlementDate && destinationSettlementDate.slice(-10).substring(0, 4),
                    '18': udfAcquirer && udfAcquirer.merchantType,
                    '32': udfAcquirer && udfAcquirer.institutionCode,
                    '35': udfAcquirer && udfAcquirer.track2,
                    '37': transferId,
                    '41': udfAcquirer && udfAcquirer.terminalId,
                    '42': udfAcquirer && udfAcquirer.identificationCode,
                    '43': udfAcquirer && udfAcquirer.terminalName,
                    '49': currency.numeric(transferCurrency),
                    '52': pinBlock,
                    '54': getISOBalance(accountType, balance.ledger, balance.available),
                    '102': sourceAccount,
                    '103': destinationAccount,
                    '122': merchantId,
                    '123': merchantInvoice
                };
            }
        }

        var result = base();
        result.mtid = '' + version + udfAcquirer.mti;
        switch ('' + udfAcquirer.mti) {
            case '200':
                break;
            case '210':
                break;
            case '420':
                result['90'] = '';
                break;
            case '430':
                break;
            case '800':
                break;
            case '810':
                break;
            default:
                result['39'] = ['96', '909'][version];
        }
        return result;
    },
    fromISO: function(msg, $meta) {
        if ($meta.mtid === 'error') {
            switch (msg[39]) {
                case '14':
                case '39':
                case '114': throw errors.invalidAccount();
                case '51':
                case '116': throw errors.insufficientFunds();
                case '55':
                case '117': throw errors.incorrectPin();
                case '68':
                case '96':
                case '909':
                case '911': throw errors.unknown();
                default: throw errors.genericDecline();
            }
        }

        function base() {
            switch (msg.mtid.substr(0, 1)) {
                case '0': return {
                    amount: {
                        transfer: currency.cents(msg[49], msg[4], 1)
                    },
                    destinationSettlementDate: msg[15],
                    localdateTime: msg[13] + msg[12],
                    transferIdAcquirer: msg[37],
                    transferIdIssuer: msg[38],
                    currency: currency.alphabetic(msg[49]),
                    pinBlock: msg[52],
                    sourceAccount: msg[102],
                    destinationAccount: msg[103],
                    merchantId: msg[122],
                    merchantInvoice: msg[123],
                    udfAcquirer: {
                        card: msg[2],
                        processingCode: msg[3],
                        merchantType: msg[18],
                        institutionCode: msg[32],
                        track2: msg[35],
                        terminalId: msg[41],
                        identificationCode: msg[42],
                        terminalName: msg[43]
                    }
                };
                case '1': return {

                };
            }
        }
        switch (msg.mtid) {
            case '0200':
                return Object.assign(base(), {
                    transferType: transferType[msg[3].substring(0, 2)]
                });
            case '0210':
                return {
                    balance: {
                        ledger: getBalance(msg[54], '01'),
                        available: getBalance(msg[54], '02')
                    },
                    transferIdIssuer: msg[38]
                };
            case '0420':
                return base();
            case '0430':
                return base();
            case '0800':
                return {
                    networkCode: msg[70],
                    networkKey: msg[48]
                };
            case '0810':
                return {
                    networkCode: msg[70]
                };
            default:
                throw errors.unknown();
        }
    }
};
