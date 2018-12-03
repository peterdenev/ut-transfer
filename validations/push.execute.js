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
                'forex',
                'agentFloatRequest'
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
    result: joi.any()
};
