var joi = require('joi');
module.exports = {
    description: '',
    notes: '',
    params: joi.object().keys({
        actorId: joi.string().example('4'),
        batchId: joi.number().example(1).description('the id of the batch'),
        account: joi.string().optional(),
        expirationDate: joi.date().optional(),
        name: joi.string().example('batch 1').optional(),
        batchStatusId: joi.number().optional(),
        batchInfo: joi.string().optional(),
        uploadInfo: joi.string().optional(),
        fileName: joi.string().optional(),
        originalFileName: joi.string().optional(),
        validatedAt: joi.date().optional()
    }),
    result: joi.object().keys({
        batchId: joi.number().example(1),
        account: joi.string().allow(null),
        expirationDate: joi.string().example('2017-04-26T12:55:28.182Z').allow(null),
        name: joi.string().example('batch 1'),
        batchStatusId: joi.number().example(5).description('batch status id'),
        batchInfo: joi.string().allow(''),
        uploadInfo: joi.string().allow(''),
        actorId: joi.string().example('4'),
        fileName: joi.string().example('1493211327449_batch-dfsp1.csv'),
        originalFileName: joi.string().example('batch-dfsp1.csv'),
        validatedAt: joi.string().example('2017-04-26T12:55:28.182Z').allow(null)
    })
};
