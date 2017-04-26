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
        acquirerCode: joi.string().allow(null),
        transferIdAcquirer: joi.string().allow(null),
        transferDateTime: joi.string().allow(null),
        channelId: joi.number(),
        channelType: joi.string(),
        ordererId: joi.number().allow(null),
        merchantId: joi.string().allow(null),
        merchantInvoice: joi.string().allow(null),
        merchantType: joi.string().allow(null),
        cardId: joi.number().allow(null),
        sourceAccount: joi.string().allow(null),
        destinationAccount: joi.string().allow(null),
        issuerId: joi.string().allow(null),
        ledgerId: joi.string().allow(null),
        amount: joi.object().keys({
            transfer: joi.object().keys({
                currency: joi.string().required(),
                amount: joi.number().required()
            })
        }),
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
        merchantErrorMessage: joi.string().allow(null),
        udfAcquirer: joi.object().allow(null),
        transferType: joi.string().allow(null),
        channelId: joi.number().allow(null),
        channelType: joi.string().allow(null),
        ordererId: joi.number().allow(null),
        sourceAccount: joi.string().allow(null),
        merchantInvoice: joi.string().allow(null),
        destinationAccount: joi.string().allow(null),
        issuerId: joi.string().allow(null),
        amount: joi.object().keys({
            transfer: joi.object().keys({
                currency: joi.string().allow(null),
                amount: joi.number().allow(null)
            }),
            acquirerFee: joi.object().keys({
                currency: joi.string().allow(null),
                amount: joi.string().allow(null),
                scale: joi.number().allow(null),
                cents: joi.number().allow(null)
            }),
            issuerFee: joi.object().keys({
                currency: joi.string().allow(null),
                amount: joi.string().allow(null),
                scale: joi.number().allow(null),
                cents: joi.number().allow(null)
            })
        }),
        transferAmount: joi.number().allow(null),
        transferCurrency: joi.string().allow(null),
        transferFee: joi.number().allow(null),
        acquirerFee: joi.number().allow(null),
        issuerFee: joi.number().allow(null),
        transferDateTime: joi.string().allow(null),
        split: joi.array().allow(null),
        merchantPort: joi.string().allow(null),
        issuerPort: joi.string().allow(null),
        ledgerPort: joi.string().allow(null),
        issuerSettlementDate: joi.string().allow(null),
        balance: joi.object().keys({
            available: joi.number().allow(null),
            ledger: joi.number().allow(null),
            accounts: joi.array().allow(null)
        }),
        ministatement: joi.object().keys({
            operations: joi.array().allow(null),
            accounts: joi.array().allow(null)
        }),
        description: joi.string().allow(null),
        acquirerCode: joi.string().allow(null),
        transferIdAcquirer: joi.string().allow(null)
    })
};
