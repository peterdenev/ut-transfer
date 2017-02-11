'use strict';
// transfer
const create = require('ut-error').define;
const Transfer = create('transfer');
const SystemDecline = create('systemDecline', Transfer, 'System decline error');
const InsufficientFunds = create('insufficientFunds', Transfer, 'Insufficient funds');
const InvalidAccount = create('invalidAccount', Transfer, 'Invalid account');
const GenericDecline = create('genericDecline', Transfer, 'Transfer declined');
const IncorrectPin = create('incorrectPin', Transfer, 'Incorrect PIN');
const Unknown = create('unknown', Transfer, 'Unknown error');
// merchant
const Merchant = create('merchant');
const MerchantGenericDecline = create('genericDecline', Merchant, 'Merchant decline');
const TimeOut = create('timeOut', Merchant, 'Merchant timeout');
const InvalidPhone = create('invalidPhone', Merchant, 'Invalid phone');
const InvalidInvoice = create('invalidInvoice', Merchant, 'Invalid invoice');
const MerchantInsufficientFunds = create('insufficientFunds', Merchant, 'Balance not enough');
const MerchantUnknown = create('unknown', Merchant, 'Unknown error');

module.exports = {
    transfer: cause => new Transfer(cause),
    systemDecline: cause => new SystemDecline(cause),
    insufficientFunds: cause => new InsufficientFunds(cause),
    invalidAccount: cause => new InvalidAccount(cause),
    genericDecline: cause => new GenericDecline(cause),
    incorrectPin: cause => new IncorrectPin(cause),
    unknown: cause => new Unknown(cause),
    merchant: cause => new Merchant(cause),
    merchantGenericDecline: cause => new MerchantGenericDecline(cause),
    merchantTimeOut: cause => new TimeOut(cause),
    merchantInvalidPhone: cause => new InvalidPhone(cause),
    merchantInvalidInvoice: cause => new InvalidInvoice(cause),
    merchantInsufficientFunds: cause => new MerchantInsufficientFunds(cause),
    merchantUnknown: cause => new MerchantUnknown(cause)
};
