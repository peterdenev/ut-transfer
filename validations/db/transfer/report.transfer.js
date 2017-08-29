'use strict';
var joi = require('joi');

module.exports = {
    description: 'get transfer report',
    notes: ['transfer report'],
    tags: ['list', 'transfer', 'report'],
    params: joi.object({
        cardNumber: joi.string().max(20),
        accountNumber: joi.string().max(100),
        deviceId: joi.string().max(100),
        channelType: joi.string().max(50),
        processingCode: joi.string(),
        startDate: joi.string(),
        endDate: joi.string(),
        issuerTxState: joi.number(),
        merchantName: joi.string().max(100),
        pageNumber: joi.number().min(1),
        pageSize: joi.number().min(1)
    }),
    result: joi.object().keys({
        transfers: joi.array(),
        pagination: joi.array().items(joi.object().keys({
            pageSize: joi.number(),
            pageNumber: joi.number(),
            pagesTotal: joi.number(),
            recordsTotal: joi.number()
        }))
    })
};
