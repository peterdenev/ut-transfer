var joi = require('joi');

module.exports = {
    description: 'Settlement report',
    params: joi.object().keys({
        settlementDate: joi.string().allow('', null)
    }),
    result: joi.object().keys({
        settlement: joi.any()
    })
};
