var joi = require('joi');

module.exports = {
    description: 'Confirms a pending transfer',
    params: joi.object().keys({
        transferId: joi.number(),
        message: joi.string(),
        userAvailableAccounts: joi.array().items(joi.string())
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
