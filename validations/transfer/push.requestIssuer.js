var joi = require('joi');

module.exports = {
    description: 'Mark transfer as confirmed by issuer',
    params: joi.object().keys({
        transferId: joi.number()
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
