const joi = require('joi');

module.exports = {
    description: 'Commission per agent authorize',
    params: joi.object(),
    result: joi.object()
};
