var joi = require('joi');

module.exports = {
    description: 'Settlement details report',
    params: joi.object().keys({
        settlementDate: joi.string().allow('', null),
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        pagination: joi.any(),
        pageNumber: joi.number().min(1),
        pageSize: joi.number().min(1)
    }),
    result: joi.object().keys({
        settlementDetails: joi.array(),
        pagination: joi.array().items(joi.object().keys({
            pageSize: joi.number(),
            pageNumber: joi.number(),
            pagesTotal: joi.number(),
            recordsTotal: joi.number()
        }))
    })
};
