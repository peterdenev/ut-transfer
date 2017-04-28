'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch partners',
    notes: ['fetch partners'],
    tags: ['transfer', 'partner', 'fetch'],
    payload: joi.any(),
    result: joi.object().keys({
        partnerId: joi.string().required(),
        partnerName: joi.string().required()
    }).required()
};
