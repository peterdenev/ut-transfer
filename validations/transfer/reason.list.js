'use strict';
var joi = require('joi');

module.exports = {
    description: 'Listing transaction reasons',
    notes: ['transfer'],
    tags: ['transfer', 'reason', 'list'],
    params: joi.object().keys({
        action: joi.string().required()
    }),
    result: joi.object().keys({
        transferReasonList: joi.array().items(
            joi.object().keys({
                itemNameId: joi.number().integer().required(),
                itemName: joi.string().required(),
                itemNameTranslation: joi.string().required()
            })
        )
    })
};
