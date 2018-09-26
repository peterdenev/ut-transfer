var joi = require('joi');

module.exports = {
    description: 'Mark transfer as confirmed by issuer',
    params: joi.object().keys({
        transferId: joi.number(),
        transferIdIssuer: joi.string(),
        actualAmount: joi.string(),
        actualAmountCurrency: joi.string()
    }),
    result: joi.array().items(
        joi.array().items(joi.object())
    )
};
