var joi = require('joi');

module.exports = {
    description: 'Creates a record in the transfer.transfer table',
    params: joi.object().keys({
        transferTypeId: joi.number(),
        acquirerCode: joi.string().max(50),
        transferDateTime: joi.string(),
        localDateTime: joi.string().max(14),
        settlementDate: joi.string().max(14),
        tramsferIdAcquirer: joi.string().max(50),
        retrievalReferenceNumber: joi.string().max(12),
        channelId: joi.number(),
        channelType: joi.string().max(50),
        ordererId: joi.number(),
        merchantId: joi.string().max(50),
        merchantInvoice: joi.string().max(50),
        merchantType: joi.string().max(50),
        cardId: joi.number(),
        sourceAccount: joi.string().max(50),
        sourceAccountHolder: joi.string().max(200),
        destinationAccount: joi.string().max(50),
        destinationAccountHolder: joi.string().max(200),
        destinationBankName: joi.string().max(100),
        swift: joi.string().max(11),
        additionalDetails: joi.string().max(500),
        expireTime: joi.string(),
        expireSeconds: joi.number(),
        transferCurrency: joi.string().max(3),
        transferAmount: joi.string().max(21),
        issuerId: joi.string().max(50),
        ledgerId: joi.string().max(50),
        acquirerFee: joi.string().max(21),
        issuerFee: joi.string().max(21),
        transferFee: joi.string().max(21),
        description: joi.string().max(250),
        udfAcquirer: joi.string(),
        split: joi.object().keys({
            transferId: joi.number(),
            conditionId: joi.number(),
            splitNameId: joi.number(),
            debit: joi.string(),
            credit: joi.string(),
            amount: joi.string(),
            description: joi.string(),
            tag: joi.string(),
            debitActorId: joi.number(),
            creditActorId: joi.number(),
            debitItemId: joi.number(),
            creditItemId: joi.number(),
            state: joi.number(),
            transferIdPayment: joi.number()
        }),
        isPending: joi.alternatives().try(
            joi.boolean(),
            joi.number().allow(1, 0)
        ).allow('1', '0'),
        userAvailableAccounts: joi.array(),
        transferPending: joi.object().keys({
            approvalAccountNumber: joi.string().max(50),
            initiatorName: joi.string().max(200)
        })
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
