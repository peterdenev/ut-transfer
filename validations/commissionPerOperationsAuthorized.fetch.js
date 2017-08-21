const joi = require('joi');

module.exports = {
    description: 'Commission per operation authorized fetch',
    params: joi.object(),
    result: joi.object()
};
