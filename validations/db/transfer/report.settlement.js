var joi = require('joi');

module.exports = {
    description: 'Settlement report',
    params: joi.object().keys({
        settlementDate: joi.string().allow('', null),
        transactionFromDate: joi.any(),
        transactionToDate: joi.any(),
        branchId: joi.any(),
        pagination: joi.any(),
        pageNumber: joi.number().min(1),
        pageSize: joi.number().min(1)
    }),
    result: joi.object().keys({
        settlement: joi.array()
    })
};
