var joi = require('joi');

module.exports = {
    description: 'List banks',
    params: joi.any(),
    result: joi.object().keys({
        banks: joi.array().items(joi.object().keys({
            swift: joi.string(),
            bankName: joi.string(),
            isDefault: joi.boolean()
        }))
    })
};
