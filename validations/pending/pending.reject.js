var joi = require('joi');

module.exports = {
    description: 'Rejects a pending transfer',
    params: joi.object().keys({
        transferId: joi.number(),
        message: joi.string(),
        reasonId: joi.number().allow(null),
        userAvailableAccounts: joi.array().items(joi.string())
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
