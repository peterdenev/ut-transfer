var joi = require('joi');

module.exports = {
    description: 'Transfer details report',
    params: joi.object().keys({
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        pageSize: joi.number(),
        pageNumber: joi.number(),
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null),
        processingCode: joi.number(),
        channelType: joi.string(),
        deviceID: joi.string()
    }),
    result: joi.object().keys({
        transferDetails: joi.array(),
        pagination: joi.array().items(joi.object().keys({
            pageSize: joi.number(),
            pageNumber: joi.number(),
            pagesTotal: joi.number(),
            recordsTotal: joi.number()
        }))
    })
};
