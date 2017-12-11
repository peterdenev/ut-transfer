'use strict';
var joi = require('joi');

module.exports = {
    description: 'list partners for dropdowns',
    notes: ['list partners'],
    tags: ['transfer', 'partner', 'list'],
    payload: joi.any(),
    result: joi.object().keys({
        partner: joi.array().items(
            joi.object().keys({
                partnerId: joi.string().required(),
                partnerName: joi.string().required()
            }))
    }).required()
};
