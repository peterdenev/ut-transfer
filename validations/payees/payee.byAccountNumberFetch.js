var joi = require('joi');

module.exports = {
    description: 'Fetches payees by account number and userId (from $meta)',
    notes: ['payee'],
    tags: ['payees', 'fetch'],
    params: joi.object().keys({
        accountNumber: joi.array().items(
            joi.string()
        )
    }),
    result: joi.object().keys({
        payeeAccounts: joi.array().items(
            joi.object().keys({
                accountNumber: joi.string(),
                payeeName: joi.string()
            })
        )
    })
};
