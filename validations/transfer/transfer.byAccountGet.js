var joi = require('joi');

module.exports = {
    description: 'Fetches information about transfers',
    params: joi.object().keys({
        startDate: joi.string().allow('', null),
        endDate: joi.string().allow('', null),
        processingCode: joi.number(),
        channelType: joi.string(),
        deviceID: joi.string(),
        pageSize: joi.number(),
        pageNumber: joi.number(),
        orderBy: joi.object().keys({
            field: joi.string(),
            dir: joi.string().valid(['asc', 'desc', ''])
        }),
        userAvailableAccounts: joi.array().items(joi.string())
    }),
    result: joi.object().keys({
        transferDetails: joi.array().items(joi.object()),
        pagination: joi.object()
    })
};
