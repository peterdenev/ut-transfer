var joi = require('joi');

module.exports = {
    description: 'Hour of Day Statistics',
    params: joi.object().keys({
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        pagination: joi.any(),
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null),
        transferCurrency: joi.string().length(3)
    }),
    result: joi.object().keys({
        transferHourOfDay: joi.array()
    })
};
