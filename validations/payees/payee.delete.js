'use strict';
var joi = require('joi');

module.exports = {
    description: 'Payee delete procedure',
    notes: ['payee'],
    tags: ['payees', 'delete'],
    params: joi.object().keys({
        payeeId: joi.number().required()
    }),
    result: joi.array()
};
