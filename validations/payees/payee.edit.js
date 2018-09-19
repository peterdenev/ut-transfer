'use strict';
var joi = require('joi');

module.exports = {
    description: 'Payee edit procedure',
    notes: ['payee'],
    tags: ['payees', 'edit'],
    params: joi.object().keys({
        payee: joi.object().keys({
            payeeId: joi.number(),
            payeeName: joi.string(),
            accountTypeId: joi.number(),
            accountNumber: joi.string(),
            bankName: joi.string(),
            SWIFT: joi.string()
        }),
        noResultSet: joi.any()
    }),
    result: joi.array().items(
        joi.object().keys({
            payee: joi.object().keys({
                payeeName: joi.string().required(),
                payeeId: joi.number().required(),
                accountTypeId: joi.number().required(),
                accountNumber: joi.string().required(),
                bankName: joi.string().required(),
                SWIFT: joi.string().required(),
                userId: joi.number()
            })
        })
    )
};
