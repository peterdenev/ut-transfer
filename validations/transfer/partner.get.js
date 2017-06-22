'use strict';
var joi = require('joi');

module.exports = {
    description: 'get partner details',
    notes: ['get partner details'],
    tags: ['transfer', 'partner', 'get'],
    params: joi.object().keys({
        partnerId: joi.string().max(50).required()
    }).required(),
    result: joi.any()
};
