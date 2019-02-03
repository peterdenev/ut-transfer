'use strict';
var joi = require('joi');

module.exports = {
    description: 'Getting transaction info',
    notes: ['transfer'],
    tags: ['transfer', 'get'],
    params: joi.object().keys({
        transferId: joi.string(),
        transferIdAcquirer: joi.string()
    }).or('transferId', 'transferIdAcquirer').required(),
    result: joi.object().keys({
        transfer: joi.object().allow(null),
        transferSplits: joi.array().items(joi.object()).allow(null)
    })
};
