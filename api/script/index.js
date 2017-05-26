const DECLINED = {
    ledger: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    issuer: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    merchant: ['merchant.genericDecline']
};
var errors = require('../../errors');
var currency = require('../../currency');

var processReversal = (bus, log) => params => {
    var transferId;

    var portReversal = (port, reversal) => {
        if (port && reversal.transferType && reversal.operation) {
            return bus.importMethod(`${port}.${reversal.transferType}.${reversal.operation}`)(reversal);
        } else {
            return Promise.resolve(reversal);
        }
    };

    var dbPushReverse = reverse => bus.importMethod('db/transfer.push.reverse')(reverse)
        .then(pushResult => {
            return reverse;
        });

    var reverse = reversal => {
        transferId = reversal.transferId;
        if (reversal && !reversal.reversed) { // reverse only transaction that have NOT been reversed
            reversal.udfAcquirer && (reversal.udfAcquirer.mti = reversal.mti);
            reversal.amount = {
                transfer: currency.amount(reversal.transferCurrency, reversal.transferAmount)
            };

            // prepare reversal object for postReversal
            if (!reversal.operation) {
                reversal.operation = 'reverse';
            }
            if (!reversal.transferType) {
                reversal.transferType = 'push';
            }

            return reversal && portReversal(reversal.issuerPort, reversal)
            .then(result => {
                if (reversal.issuerPort === reversal.ledgerPort) {
                    return reversal;
                } else {
                    return portReversal(reversal.ledgerPort, reversal)
                    .then(() => reversal);
                }
            });
        } else {
            throw errors.transferAlreadyReversed();
        }
    };

    var confirmReversal = reversalResult => {
        return transferId && bus.importMethod('db/transfer.push.confirmReversal')({
            transferId
        })
        .then(function(confirmReversalResult) {
            return reversalResult;
        });
    };

    var failReversal = reversalError => {
        return Promise.resolve(transferId && bus.importMethod('db/transfer.push.failReversal')({
            transferId,
            type: reversalError.type || ('issuer.error'),
            message: reversalError.message,
            details: reversalError
        }))
        .catch(error => {
            log.error && log.error(error);
            return Promise.reject(reversalError);
        })// .this is intentionally after catch as we do not want to log the reversalError
        .then(() => {
            return Promise.reject(reversalError);
        });
    };

    return dbPushReverse(params)
        .then(reverse)
        .then(confirmReversal)
        .catch(failReversal);
};

var ruleValidate = (bus, transfer) => {
    return bus.importMethod('db/rule.decision.lookup')({
        channelId: transfer.channelId,
        operation: transfer.transferType,
        sourceAccount: transfer.sourceAccount,
        destinationAccount: transfer.destinationAccount,
        amount: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount,
        currency: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency,
        isSourceAmount: false
    }).then(decision => {
        transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
        transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
        if (decision.amount) {
            transfer.transferFee = decision.amount.acquirerFee + decision.amount.issuerFee;
            transfer.acquirerFee = decision.amount.acquirerFee;
            transfer.issuerFee = decision.amount.issuerFee;
            transfer.amount.acquirerFee = currency.amount(transfer.transferCurrency, transfer.acquirerFee);
            transfer.amount.issuerFee = currency.amount(transfer.transferCurrency, transfer.issuerFee);
        }
        transfer.transferDateTime = decision.amount && decision.amount.transferDateTime;
        transfer.transferTypeId = decision.amount && decision.amount.transferTypeId;
        transfer.split = decision.split;
        return transfer;
    })
    .catch(error => {
        transfer.abortAcquirer = error;
        transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
        transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
        return bus.importMethod('db/rule.operation.lookup')({operation: transfer.transferType})
            .then(result => {
                transfer.transferDateTime = result && result.operation && result.operation.transferDateTime;
                transfer.transferTypeId = result && result.operation && result.operation.transferTypeId;
                return transfer;
            });
    });
};

module.exports = {
    'rule.validate': function(params) {
        return ruleValidate(this.bus, params);
    },
    'push.execute': function(params) {
        var handleError = (transfer, where) => error => {
            var method;
            if (where === 'Acquirer') {
                method = this.bus.importMethod('db/transfer.push.abortAcquirer');
            } else if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
                method = this.bus.importMethod('db/transfer.push.fail' + where);
            } else {
                method = this.bus.importMethod('db/transfer.push.reverse' + where);
            }
            return method({
                transferId: transfer.transferId,
                source: where,
                type: error.type || (where + '.error'),
                message: error.message,
                details: error
            })
            .catch(x => {
                this.log.error && this.log.error(x);
                return Promise.reject(error);
            }) // .this is intentionally after catch as we do not want to this.log the original error
            .then(x => Promise.reject(error));
        };
        var dbPushExecute = transfer => this.bus.importMethod('db/transfer.push.create')(transfer)
            .then(pushResult => {
                pushResult = pushResult && pushResult[0] && pushResult[0][0];
                if (pushResult && pushResult.transferId) {
                    transfer.transferId = pushResult.transferId;
                    transfer.issuerSettlementDate = pushResult.issuerSettlementDate;
                    transfer.localDateTime = pushResult.localDateTime;

                    // Set ports
                    transfer.merchantPort = pushResult.merchantPort;
                    transfer.issuerPort = pushResult.issuerPort;
                    transfer.ledgerPort = pushResult.ledgerPort;
                    if (transfer.abortAcquirer) {
                        return handleError(transfer, 'Acquirer')(transfer.abortAcquirer);
                    } else {
                        return transfer;
                    }
                } else {
                    throw errors.systemDecline('transfer.push.create');
                }
            });
        var merchantTransferValidate = (transfer) => {
            if (transfer.merchantPort) {
                return this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'validate'].join('.'))(transfer)
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };

        function canSkip(transfer) { // todo streamline skip logic
            return ((transfer.transferType === 'changePin') && (transfer.issuerFee === 0)) ||
                ((transfer.transferType === 'sms') && (transfer.issuerFee === 0));
        }

        var ledgerPushExecute = (transfer) => {
            if (transfer.ledgerPort && (transfer.issuerPort !== transfer.ledgerPort)) {
                return this.bus.importMethod('db/transfer.push.requestLedger')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod(transfer.ledgerPort + '.push.execute'))
                    .catch(handleError(transfer, 'Ledger'))
                    .then(result => {
                        transfer.transferIdLedger = result.transferIdIssuer;
                        result.transferId = transfer.transferId;
                        result.transferIdLedger = transfer.transferIdIssuer;
                        return result;
                    })
                    .then(this.bus.importMethod('db/transfer.push.confirmLedger'))
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };
        var issuerPushExecute = (transfer) => {
            if (transfer.issuerPort && !canSkip(transfer)) {
                return this.bus.importMethod('db/transfer.push.requestIssuer')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod(transfer.issuerPort + '.push.execute'))
                    .then(result => {
                        if (transfer.transferType === 'ministatement') {
                            transfer.ministatement = result.ministatement;
                        }
                        transfer.balance = result.balance;
                        transfer.transferIdIssuer = result.transferIdIssuer;

                        result.transferId = transfer.transferId;
                        return result;
                    })
                    .catch(handleError(transfer, 'Issuer'))
                    .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };
        var merchantTransferExecute = (transfer) => {
            if (transfer.merchantPort) {
                return this.bus.importMethod('db/transfer.push.requestMerchant')(transfer)
                    .then(() => transfer)
                    .then(this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'execute'].join('.')))
                    .then(merchantResult => {
                        transfer.transferIdMerchant = merchantResult.transferIdMerchant;
                        merchantResult.transferId = transfer.transferId;
                        merchantResult.transferIdMerchant = transfer.transferIdMerchant;
                        return merchantResult;
                    })
                    .catch(handleError(transfer, 'Merchant'))
                    .then(this.bus.importMethod('db/transfer.push.confirmMerchant'))
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };

        return ruleValidate(this.bus, params)
            .then(dbPushExecute)
            .then(merchantTransferValidate)
            .then(ledgerPushExecute)
            .then(issuerPushExecute)
            .then(merchantTransferExecute);
    },
    'idle.execute': function(params, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('db/transfer.idle.execute')(params)
            .then(idleResult => idleResult && idleResult.transferId && processReversal(this.bus, this.log)(idleResult));
    },
    'push.reverse': function(params, $meta) {
        var getTransfer = (params) => this.config['transfer.transfer.get']({
            transferId: params.transferId,
            transferIdAcquirer: params.transferIdAcquirer,
            acquirerCode: params.acquirerCode,
            cardId: params.cardId,
            localDateTime: params.localDateTime
        }, $meta)
        .then(result => {
            if (!result || !result.transferId) {
                throw errors.notFound();
            } else {
                var transferInfo = Object.assign({
                    message: params.message,
                    mti: '430',
                    operation: 'reverse',
                    transferType: 'push'
                }, result);
                return transferInfo;
            }
        });

        return getTransfer(params)
            .then(processReversal(this.bus, this.log));
    },
    'card.execute': function(params) {
        if (params.abortAcquirer) {
            return this.bus.importMethod('transfer.push.execute')(params);
        } else {
            return this.bus.importMethod('db/atm.card.check')({
                cardId: params.cardId,
                sourceAccount: params.sourceAccount,
                sourceAccountType: params.sourceAccountType,
                destinationType: params.destinationType,
                destinationTypeId: params.destinationTypeId,
                destinationAccount: params.destinationAccount,
                destinationAccountType: params.destinationAccountType,
                pinOffset: params.pinOffset,
                pinOffsetNew: params.pinOffsetNew,
                mode: params.mode
            })
            .catch(error => {
                params.abortAcquirer = error;
                return this.bus.importMethod('transfer.push.execute')(params);
            })
            .then(result => Object.assign(params, {
                sourceAccount: result.sourceAccountNumber,
                sourceAccountName: result.sourceAccountName,
                destinationAccount: result.destinationAccountNumber,
                destinationAccountName: result.destinationAccountName,
                issuerId: result.issuerId,
                ledgerId: result.ledgerId,
                cardNumber: result.cardNumber,
                ordererId: result.ordererId
            }))
            .then(result => !params.transferIdAcquirer && this.bus.importMethod(`db/${params.channelType}.terminal.nextId`)({
                channelId: result.channelId
            }))
            .then(result => {
                if (params.transferIdAcquirer) {
                    return params;
                }
                if (!result || !result[0] || !result[0][0] || !result[0][0].tsn) {
                    throw errors.nextId();
                }
                params.transferIdAcquirer = result[0][0].tsn;
                return params;
            })
            .then(this.bus.importMethod('transfer.push.execute'));
        }
    },
    'transfer.get': function(msg, $meta) {
        return this.bus.importMethod('db/transfer.transfer.get')(msg, $meta)
            .then((dbResult) => {
                var transferResults = dbResult.transfer;
                var result = {};

                if (transferResults && Array.isArray(transferResults) && transferResults.length > 0) {
                    result = Object.assign({}, transferResults[0]);
                    result.split = dbResult.transferSplit;
                }
                return result;
            });
    }
};
// todo handle timeout from destination port
