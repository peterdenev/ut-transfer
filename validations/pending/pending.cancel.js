var joi = require('joi');

module.exports = {
    description: 'Cancels a pending transfer',
    params: joi.object().keys({
        transferId: joi.number(),
        message: joi.string(),
        reasonId: joi.number().allow(null)
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
