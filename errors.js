var create = require('ut-error').define;

var Transfer = create('transfer');
var System = create('system', Transfer, 'System error');
var Generic = create('generic', Transfer, 'Generic error');
var InsufficientFunds = create('insufficientFunds', Transfer, 'Insufficient funds');
var InvalidAccount = create('invalidAccount', Transfer, 'Invalid account');
var GenericDecline = create('genericDecline', Transfer, 'Transfer declined');
var IncorrectPin = create('incorrectPin', Transfer, 'Incorrect PIN');
var Reversed = create('reversed', Transfer, 'Transaction is already reversed.');
var Unknown = create('unknown', Transfer, 'Unknown error');

module.exports = {
    transfer: cause => new Transfer(cause),
    system: cause => new System(cause),
    generic: cause => new Generic(cause),
    insufficientFunds: cause => new InsufficientFunds(cause),
    invalidAccount: cause => new InvalidAccount(cause),
    genericDecline: cause => new GenericDecline(cause),
    incorrectPin: cause => new IncorrectPin(cause),
    reversed: cause => new Reversed(cause),
    unknown: cause => new Unknown(cause)
};
