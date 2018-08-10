'use strict';
var joi = require('joi');

module.exports = {
    description: 'Payee get procedure',
    notes: ['payee'],
    tags: ['payees', 'get'],
    params: joi.object().keys({
        payeeId: joi.number().required()
    }),
    result: joi.array().items(
        joi.array().items(joi.object().keys({
            payee: joi.object().keys({
                payeeId: joi.number(),
                payeeName: joi.string().required(),
                accountTypeId: joi.number().required(),
                accountNumber: joi.string().required(),
                bankName: joi.string().required(),
                SWIFT: joi.string().required()
            })
        }))
    )
};