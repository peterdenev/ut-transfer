var joi = require('joi');

module.exports = {
    description: 'Fetches information about a transfer - for receipt',
    params: joi.object().keys({
        transferId: joi.number()
    }),
    result: joi.any()
};
