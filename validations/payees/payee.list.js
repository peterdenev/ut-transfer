'use strict';
var joi = require('joi');

module.exports = {
    description: 'Payee list procedure',
    notes: ['payee'],
    tags: ['payees', 'list'],
    params: joi.object(),
    result: joi.object().keys({
        payees: joi.array().items(joi.object().keys({
            payeeId: joi.number().required(),
            payeeName: joi.string().required(),
            accountTypeId: joi.number().required(),
            accountNumber: joi.string().required(),
            bankName: joi.string().required(),
            SWIFT: joi.string()
        }))
    })
};
