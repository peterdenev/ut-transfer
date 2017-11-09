'use strict';
const create = require('ut-error').define;
const Transfer = create('transfer');
const Merchant = create('merchant');
const Currency = create('currency');

module.exports = {
    transfer: Transfer,
    systemDecline: create('systemDecline', Transfer, 'System decline error'),
    insufficientFunds: create('insufficientFunds', Transfer, 'Insufficient funds'),
    transferIdAlreadyExists: create('idAlreadyExists', Transfer, 'Transfer ID already exists'),
    invalidAccount: create('invalidAccount', Transfer, 'Invalid account'),
    genericDecline: create('genericDecline', Transfer, 'Transfer declined'),
    incorrectPin: create('incorrectPin', Transfer, 'Incorrect PIN'),
    notFound: create('notFound', Transfer, 'Transfer not found'),
    unknown: create('unknown', Transfer, 'Unknown error'),
    merchant: Merchant,
    merchantGenericDecline: create('genericDecline', Merchant, 'Merchant decline'),
    merchantTimeOut: create('timeOut', Merchant, 'Merchant timeout'),
    merchantInvalidPhone: create('invalidPhone', Merchant, 'Invalid phone'),
    merchantInvalidInvoice: create('invalidInvoice', Merchant, 'Invalid invoice'),
    merchantInsufficientFunds: create('insufficientFunds', Merchant, 'Balance not enough'),
    merchantUnknown: create('unknown', Merchant, 'Unknown error'),
    invalidCurrency: create('invalidCurrency', Currency, 'Invalid currency "{currency}"'),
    invalidAmount: create('invalidAmount', Currency, 'Invalid amount "{amount} {currency}"'),
    invalidTransferId: create('invalidTransferId', Transfer, 'Invalid transfer id'),
    unauthorizedPullTransfer: create('unauthorizedTransfer', Transfer, 'Unauthorized pull transfer'),
    reasonNameExists: create('reasonNameExists', Transfer, 'Transfer reasons name already exists'),
    transferAlreadyReversed: create('transferAlreadyReversed', Transfer, 'Transfer has been already reversed'),
    transferInvalidPendingTransfer: create('transferInvalidPendingTransfer', Transfer, 'Invalid pending transfer status'),
    merchantRejectFailure: create('rejectFailure', Transfer, 'Merchant payment reject failure'),
    invalidTransferIdReverse: create('invalidTransferIdReverse', Transfer, 'Invalid Transfer ID! Only Original transfers can be reversed'),
    clearedTransfer: create('clearedTransfer', Transfer, 'Cleared Transfer'),
    invalidReplacementAmount: create('invalidReplacementAmount', Transfer, 'Invalid Replacement Amount'),
    acquirerTransferIdNotFound: create('acquirerTransferIdNotFound', Transfer, 'Acquirer Transfer Id Not Found'),
};
