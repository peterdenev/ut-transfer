var joi = require('joi');

module.exports = {
    description: 'Day of Week Statistics',
    params: joi.object().keys({
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null)
    }),
    result: joi.object().keys({
        transferDayOfWeek: joi.any()
    })
};
