var joi = require('joi');
module.exports = {
    description: 'fetch batches visible for a given actor',
    notes: '',
    params: joi.object().keys({
        actorId: joi.string().example('4')
    }),
    result: joi.array().items(joi.object().keys({
        batchId: joi.number().example(1),
        name: joi.string().description('batch name'),
        batchStatusId: joi.number().example(5).description('batch status id'),
        status: joi.string().example('new'),
        createdAt: joi.string().example('2017-04-26T12:55:28.182Z'),
        lastValidation: joi.string().example('2017-04-26T12:55:28.182Z').allow(null),
        paymentsCount: joi.string().example('22')
    }))
};
