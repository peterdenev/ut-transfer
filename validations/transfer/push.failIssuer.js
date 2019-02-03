var joi = require('joi');

module.exports = {
    description: 'Mark transfer as failed by issuer',
    params: joi.object().keys({
        transferId: joi.string(),
        type: joi.string(),
        message: joi.string()
    }),
    result: joi.any()
};
