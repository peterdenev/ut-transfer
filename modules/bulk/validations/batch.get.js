var joi = require('joi');
module.exports = {
    description: 'get details of a batch',
    notes: '',
    params: joi.object().keys({
        batchId: joi.number().example(1)
    }),
    result: joi.object().keys({
        batchId: joi.number().example(1),
        account: joi.string().allow(null),
        expirationDate: joi.string().example('2017-04-26T12:55:28.182Z').allow(null),
        name: joi.string().example('batch 1'),
        batchStatusId: joi.number().example(5).description('batch status id'),
        info: joi.string().allow(''),
        actorId: joi.string().example('4'),
        status: joi.string().example('new'),
        fileName: joi.string().example('1493211327449_batch-dfsp1.csv'),
        originalFileName: joi.string().example('batch-dfsp1.csv'),
        createdAt: joi.string().example('2017-04-26T12:55:28.182Z').allow(null),
        updatedAt: joi.string().example('2017-04-26T12:55:28.182Z').allow(null),
        paymentsCount: joi.string().example('22')
    })
};
