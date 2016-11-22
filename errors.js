var create = require('ut-error').define;

var Transfer = create('transfer');
var Generic = create('generic', Transfer);
var InsufficientFunds = create('insufficientFunds', Transfer);
var InvalidAccount = create('invalidAccount', Transfer);
var GenericDecline = create('genericDecline', Transfer);
var IncorrectPin = create('incorrectPin', Transfer);
var Unknown = create('unknown', Transfer);

module.exports = {
    transfer: function(cause) {
        return new Transfer(cause);
    },
    generic: function(cause) {
        return new Generic(cause);
    },
    insufficientFunds: function(cause) {
        return new InsufficientFunds(cause);
    },
    invalidAccount: function(cause) {
        return new InvalidAccount(cause);
    },
    genericDecline: function(cause) {
        return new GenericDecline(cause);
    },
    incorrectPin: function(cause) {
        return new IncorrectPin(cause);
    },
    unknown: function(cause) {
        return new Unknown(cause);
    }
};
