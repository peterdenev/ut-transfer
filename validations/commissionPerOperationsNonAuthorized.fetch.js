const joi = require('joi');

module.exports = {
    description: 'Commission per operation non authorized fetch',
    params: joi.object(),
    result: joi.object()
};
