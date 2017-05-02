var joi = require('joi');
module.exports = {
    description: 'fetch batch payments',
    notes: '',
    params: joi.object().keys({
        batchId: joi.string().example('1').description('the id of the batch')
    }).unknown(),
    result: joi.array().items(joi.object().keys({
        paymentId: joi.string().example('6'),
        lastName: joi.string().example('cooper'),
        identifier: joi.string().example('1233123').allow(null).allow(''),
        sequenceNumber: joi.number().example(2),
        nationalId: joi.string().example('987654321'),
        info: joi.string().example('User not found'),
        updatedAt: joi.string().example('2017-04-26T12:55:39.444Z'),
        paymentStatusId: joi.number().example(7),
        batchId: joi.number().example(2),
        dob: joi.string().example('1989-03-21T22:00:00.000Z'),
        name: joi.string().example('bulk4'),
        status: joi.string().example('mismatch'),
        amount: joi.string().example('222'),
        createdAt: joi.string().example('2017-04-26T12:55:27.792Z'),
        firstName: joi.string().example('alice')
    }))
};
