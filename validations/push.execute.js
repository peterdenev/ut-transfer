var joi = require('joi');

module.exports = {
    description: 'Transfer push execute',
    params: joi.object().keys({
        transferType: joi.string().valid(
            [
                'deposit',
                'withdraw',
                'withdrawOtp',
                'transfer',
                'transferOtp',
                'balance',
                'ministatement',
                'topup',
                'bill',
                'sale',
                'sms',
                'changePin',
                'loanDisburse',
                'loanRepay',
                'forex'
            ]
        ),
        transferIdAcquirer: joi.string().allow(null),
        transferDateTime: joi.string().allow(null),
        channelId: joi.number(),
        channelType: joi.string(),
        ordererId: joi.number().allow(null),
        merchantId: joi.number().allow(null),
        merchantInvoice: joi.string().allow(null),
        merchantType: joi.string().allow(null),
        cardId: joi.number().allow(null),
        sourceAccount: joi.string().allow(null),
        destinationAccount: joi.string().allow(null),
        destinationId: joi.string().allow(null),
        transferCurrency: joi.string(),
        transferAmount: joi.string(),
        acquirerFee: joi.string().allow(null),
        issuerFee: joi.string().allow(null),
        transferFee: joi.string().allow(null),
        description: joi.string().allow(null),
        udfAcquirer: joi.object().allow(null), // todo include key types
        udfIssuer: joi.object().allow(null), // todo include key types
        udfTransfer: joi.object().allow(null) // todo include key types
    }),
    result: joi.object().keys({
        transferId: joi.number(),
        transferTypeId: joi.number(),
        localDateTime: joi.string(),
        balance: joi.string(),
        transferIdIssuer: joi.string().allow(null),
        transferIdMerchant: joi.string().allow(null),
        expireTime: joi.string().allow(null),
        expireCount: joi.number().allow(null),
        reversed: joi.number(),
        retryTime: joi.string().allow(null),
        retryCount: joi.number().allow(null),
        issuerTxState: joi.number().allow(null),
        acquirerTxState: joi.number().allow(null),
        merchantTxState: joi.number().allow(null),
        issuerErrorType: joi.string().allow(null),
        issuerErrorMessage: joi.string().allow(null),
        reversalErrorType: joi.string().allow(null),
        reversalErrorMessage: joi.string().allow(null),
        acquirerErrorType: joi.string().allow(null),
        acquirerErrorMessage: joi.string().allow(null),
        merchantErrorType: joi.string().allow(null),
        merchantErrorMessage: joi.string().allow(null)
    })
};
