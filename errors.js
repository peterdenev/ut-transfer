'use strict';
module.exports = function error({utError: {defineError, getError, fetchErrors}}) {
    if (!getError('transfer')) {
        const Transfer = getError('transfer') || defineError('transfer', undefined, 'Transfer generic');
        defineError('systemDecline', Transfer, 'System decline error');
        defineError('insufficientFunds', Transfer, 'Insufficient funds');
        defineError('idAlreadyExists', Transfer, 'Transfer ID already exists');
        defineError('creditAccountNotAllowed', Transfer, 'Credit account not allowed');
        defineError('invalidCurrentAccount', Transfer, 'Invalid current account');
        defineError('invalidSavingsAccount', Transfer, 'Invalid savings account');
        defineError('invalidAccountType', Transfer, 'Invalid account type');
        defineError('invalidAccount', Transfer, 'Invalid account');
        defineError('inactiveAccount', Transfer, 'Inactive account');
        defineError('genericDecline', Transfer, 'Transfer declined');
        defineError('incorrectPin', Transfer, 'Incorrect PIN');
        defineError('notFound', Transfer, 'Transfer not found');
        defineError('unknown', Transfer, 'Unknown error');
        defineError('invalidTransferId', Transfer, 'Invalid transfer id');
        defineError('unauthorizedTransfer', Transfer, 'Unauthorized pull transfer');
        defineError('reasonNameExists', Transfer, 'Transfer reasons name already exists');
        defineError('transferAlreadyReversed', Transfer, 'Transfer has been already reversed');
        defineError('transferInvalidPendingTransfer', Transfer, 'Invalid pending transfer status');
        defineError('rejectFailure', Transfer, 'Merchant payment reject failure');
        defineError('invalidTransferType', Transfer, 'Invalid transfer type');
        defineError('unknownIssuer', Transfer, 'Unknown issuer');
        defineError('invalidIssuer', Transfer, 'Invalid issuer');
        defineError('issuerNotConnected', Transfer, 'No connection to issuer');
        defineError('issuerTimeout', Transfer, 'Issuer times out');
        defineError('issuerDisconnected', Transfer, 'Destination not Available');
    }
    if (!getError('merchant')) {
        const Merchant = getError('merchant') || defineError('merchant', undefined, 'Merchant generic');
        defineError('genericDecline', Merchant, 'Merchant decline');
        defineError('timeOut', Merchant, 'Merchant timeout');
        defineError('invalidPhone', Merchant, 'Invalid phone');
        defineError('invalidInvoice', Merchant, 'Invalid invoice');
        defineError('insufficientFunds', Merchant, 'Balance not enough');
        defineError('unknown', Merchant, 'Unknown error');
    }
    if (!getError('currency')) {
        const Currency = getError('currency') || defineError('currency', undefined, 'Currency generic');
        defineError('invalidCurrency', Currency, 'Invalid currency "{currency}"');
        defineError('invalidAmount', Currency, 'Invalid amount "{amount} {currency}"');
    }

    return Object.assign({},
        fetchErrors('transfer'),
        fetchErrors('merchant'),
        fetchErrors('currency')
    );
};
