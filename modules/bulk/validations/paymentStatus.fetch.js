var joi = require('joi');
module.exports = {
    description: 'fetch an array of payment statuses',
    notes: '',
    params: joi.object().keys({

    }),
    result: joi.array().items(joi.object().keys({
        description: joi.string().example('Payment is newly created'),
        key: joi.number().example(1),
        name: joi.string().example('new')
    }))
};
