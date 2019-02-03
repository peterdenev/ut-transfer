'use strict';
var joi = require('joi');

module.exports = {
    description: 'Payee add procedure',
    notes: ['payee'],
    tags: ['payees', 'add'],
    params: joi.object().keys({
        payee: joi.object().keys({
            payeeName: joi.string().required(),
            accountTypeId: joi.number().required(),
            accountNumber: joi.string().required(),
            bankName: joi.string().required(),
            SWIFT: joi.string().required()
        })
    }),
    result: joi.array().items(
        joi.object().keys({
            payee: joi.object().keys({
                payeeName: joi.string().required(),
                payeeId: joi.number().required(),
                userId: joi.number().required(),
                accountTypeId: joi.number().required(),
                accountNumber: joi.string().required(),
                bankName: joi.string().required(),
                SWIFT: joi.string().required()
            })
        })
    )
};
