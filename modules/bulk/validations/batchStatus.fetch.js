var joi = require('joi');
module.exports = {
    description: 'fetch an array of batch statuses',
    notes: '',
    params: joi.object().keys({

    }),
    result: joi.array().items(joi.object().keys({
        description: joi.string().example('Batch is uploading'),
        key: joi.number().example(1),
        name: joi.string().example('uploading')
    }))
};
