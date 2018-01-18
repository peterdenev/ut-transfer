'use strict';
var joi = require('joi');

module.exports = {
    description: 'add new partner',
    notes: ['add partner'],
    tags: ['transfer', 'partner', 'add'],
    params: joi.object().keys({
        partner: joi.object().keys({
            partnerId: joi.string().max(50).required(),
            name: joi.string().max(50).required(),
            port: joi.string().max(50).required(),
            mode: joi.string().max(20).required(),
            settlementDate: joi.string().allow(null),
            settlementAccount: joi.string().allow([null, '']).max(50),
            feeAccount: joi.string().allow([null, '']).max(50),
            commissionAccount: joi.string().allow([null, '']).max(50),
            serialNumber: joi.number().allow(null).min(1).max(9999)
        }).required()
    }).required(),
    result: joi.any()
};
