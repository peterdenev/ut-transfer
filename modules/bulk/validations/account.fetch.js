var joi = require('joi');
module.exports = {
    description: 'get list of accounts to be used to initiate the bulk payment transfer',
    notes: '',
    params: joi.object().keys({
        actorId: joi.string().example('4')
    }),
    result: joi.array().items(joi.object().keys({
        id: joi.string().description('account id'),
        name: joi.string().description('account name')
    }).unknown())
};
