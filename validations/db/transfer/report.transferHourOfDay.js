var joi = require('joi');

module.exports = {
    description: 'Hour of Day Statistics',
    params: joi.object().keys({
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null)
    }),
    result: joi.object().keys({
        transferHourOfDay: joi.any()
    })
};
