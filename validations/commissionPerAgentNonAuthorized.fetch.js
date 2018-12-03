const joi = require('joi');

module.exports = {
    description: 'Commission per agent non authorized fetch',
    params: joi.object(),
    result: joi.object()
};
