var joi = require('joi');

module.exports = {
    description: 'Transfer Transaction Type',
    params: joi.object().keys({
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null),
        transferCurrency: joi.string().length(3)
    }),
    result: joi.object().keys({
        transferTransactyonType: joi.any()
    })
};
