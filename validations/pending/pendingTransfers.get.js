var joi = require('joi');

module.exports = {
    description: 'Fetches pending transfers',
    params: joi.object().keys({
        userAvailableAccounts: joi.array().items(joi.string()),
        pageSize: joi.number(),
        pageNumber: joi.number(),
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        })
    }),
    result: joi.object().keys({
        pendingTransactions: joi.array().items(joi.object()),
        pagination: joi.object()
    })
};
