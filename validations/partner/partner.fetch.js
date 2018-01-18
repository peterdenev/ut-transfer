'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch partners',
    notes: ['fetch partners'],
    tags: ['transfer', 'partner', 'fetch'],
    params: joi.object().keys({
        orderBy: joi.array().items(joi.object({
            field: joi.string().min(1).max(128),
            dir: joi.string().valid(['ASC', 'DESC'])
        })).optional(),
        filterBy: joi.object().keys({
            partnerId: joi.string().max(50).allow(null),
            name: joi.string().max(50).allow(null),
            port: joi.string().max(50).allow(null),
            mode: joi.string().max(20).allow(null)
        }).optional(),
        paging: joi.object().keys({
            pageNumber: joi.number().min(1).required(),
            pageSize: joi.number().min(1).required()
        }).optional()
    }),
    result: joi.any()
};
