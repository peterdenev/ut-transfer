var joi = require('joi');
module.exports = {
    description: '',
    notes: '',
    params: joi.object().keys({
        actorId: joi.string().example('4'),
        payments: joi.array().items(joi.object().keys({
            paymentId: joi.string().example('6'),
            lastName: joi.string().example('cooper'),
            identifier: joi.string().example('12331122').allow(null).allow(''),
            sequenceNumber: joi.number().example(2),
            name: joi.string().example('bulk4'),
            nationalId: joi.string().example('987654321'),
            info: joi.string().example('User not found'),
            updatedAt: joi.string().example('2017-04-26T12:55:39.444Z'),
            status: joi.string().example('mismatch'),
            paymentStatusId: joi.number().example(7),
            batchId: joi.number().example(2),
            dob: joi.string().example('1989-03-21T22:00:00.000Z'),
            amount: joi.string().example('222.00'),
            createdAt: joi.string().example('2017-04-26T12:55:27.792Z'),
            firstName: joi.string().example('alice')
        }))
    }),
    result: joi.object().keys({
        payments: joi.array().items(joi.object().keys({
            paymentId: joi.number().example(6),
            lastName: joi.string().example('cooper'),
            identifier: joi.string().example('12332112').allow(null).allow(''),
            sequenceNumber: joi.number().example(2),
            nationalId: joi.string().example('987654321'),
            info: joi.string().example('User not found'),
            updatedAt: joi.string().example('2017-04-26T12:55:39.444Z'),
            paymentStatusId: joi.number().example(7),
            batchId: joi.number().example(2),
            dob: joi.string().example('1989-03-21T22:00:00.000Z'),
            amount: joi.number().example(222),
            createdAt: joi.string().example('2017-04-26T12:55:27.792Z'),
            firstName: joi.string().example('alice')
        }))
    })
};
