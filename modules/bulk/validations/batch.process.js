var joi = require('joi');
module.exports = {
    description: '',
    notes: '',
    params: joi.object().keys({
        account: joi.string().required().example('http://localhost:8014/ledger/accounts/agent'),
        batchId: joi.string().example('1').description('the id of the batch'),
        expirationDate: joi.string().example('2017-04-26T12:55:28.182Z').description('until when the batch payments should be retried')
    }),
    result: joi.object().keys({
        queued: joi.number().example(1223).description('the number of payments from the batch that are queued for processing')
    })
};
