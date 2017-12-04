const DECLINED = {
    ledger: [
        'transfer.insufficientFunds',
        'transfer.invalidAccount',
        'transfer.creditAccountNotAllowed',
        'transfer.invalidCurrentAccount',
        'transfer.invalidSavingsAccount',
        'transfer.invalidAccountType',
        'transfer.genericDecline',
        'transfer.incorrectPin'
    ],
    issuer: [
        'transfer.insufficientFunds',
        'transfer.invalidAccount',
        'transfer.creditAccountNotAllowed',
        'transfer.invalidCurrentAccount',
        'transfer.invalidSavingsAccount',
        'transfer.invalidAccountType',
        'transfer.genericDecline',
        'transfer.incorrectPin'
    ],
    merchant: ['merchant.genericDecline']
};
var errors = require('../../errors');
var currency = require('../../currency');

var processReversal = (bus, log, $meta) => params => {
    var transferId;

    var portReversal = (port, reversal) => {
        if (port && reversal.transferType && reversal.operation) {
            var $postReversalMeta = Object.assign($meta, {method: `${port}.${reversal.transferType}.${reversal.operation}`});
            return bus.importMethod($postReversalMeta.method)(reversal, $postReversalMeta);
        } else {
            return Promise.resolve(reversal);
        }
    };

    var dbPushReverse = reverse => {
        var $pushReverseMeta = Object.assign($meta, {method: 'db/transfer.push.reverse'});
        return bus.importMethod($pushReverseMeta.method)(reverse, $pushReverseMeta)
            .then(pushResult => {
                return reverse;
            });
    };

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
        return transferId && bus.importMethod('db/transfer.push.confirmReversal')({transferId})
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

var hashTransferPendingSecurityCode = (bus, transfer) => {
    if (transfer.transferPending && transfer.pullTransfer && transfer.pullTransfer.pending && transfer.pullTransfer.pending.params && transfer.transferPending.securityCode) {
        return bus.importMethod('user.genHash')(transfer.transferPending.securityCode, JSON.parse(transfer.pullTransfer.pending.params));
    } else if (transfer.transferPending && transfer.transferPending.securityCode) {
        return bus.importMethod('user.getHash')({ value: transfer.transferPending.securityCode });
    } else {
        return Promise.resolve(null);
    }
};

module.exports = {
    'rule.validate': function(params) {
        return ruleValidate(this.bus, params);
    },
    'push.execute': function(params, $meta) {
        var handleError = (transfer, where) => error => {
            var method;
            if (where === 'Acquirer') {
                method = this.bus.importMethod('db/transfer.push.abortAcquirer');
            } else if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
                method = this.bus.importMethod('db/transfer.push.fail' + where);
            } else {
                method = this.bus.importMethod('db/transfer.push.reverse' + where);
            }
            let transferDetails = Object.assign({}, transfer, error.transferDetails);
            error = Object.assign({}, error, {transferDetails});
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
        var dbPushExecute = transfer => this.bus.importMethod('db/transfer.push.create')(transfer, Object.assign($meta, {method: 'db/transfer.push.create'}))
            .then(pushResult => {
                pushResult = pushResult && pushResult[0] && pushResult[0][0];
                if (pushResult && pushResult.transferId) {
                    transfer.transferId = pushResult.transferId;
                    transfer.issuerSettlementDate = pushResult.issuerSettlementDate;
                    transfer.localDateTime = pushResult.localDateTime;
                    transfer.issuerSerialNumber = pushResult.issuerSerialNumber;
                    // Set ports
                    transfer.merchantPort = pushResult.merchantPort;
                    transfer.issuerPort = pushResult.issuerPort;
                    transfer.ledgerPort = pushResult.ledgerPort;

                    if (transfer.abortAcquirer) {
                        return handleError(transfer, 'Acquirer')(transfer.abortAcquirer);
                    } else {
                        // Add splits for pending transaction
                        if (transfer.pullTransferId) {
                            transfer.split = transfer.split.concat(transfer.pullTransfer.split);
                        }
                        return transfer;
                    }
                } else {
                    throw errors.systemDecline('transfer.push.create');
                }
            });

        const merchantTransferValidate = (transfer) => {
            if (transfer.merchantPort) {
                return this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'validate'].join('.'))(transfer)
                    .then(() => transfer);
            } else {
                return transfer;
            }
        };

        const canSkip = transfer => { // todo streamline skip logic
            return ((transfer.transferType === 'changePin') && (transfer.issuerFee === 0)) ||
                ((transfer.transferType === 'sms') && (transfer.issuerFee === 0)) ||
                (transfer.transferType === 'tia');
        };

        const parseResult = (transfer, result, type) => {
            transfer[`transferId${type}`] = result.transferIdIssuer;
            transfer.acquirerFee = result.acquirerFee || transfer.acquirerFee;
            transfer.issuerFee = result.issuerFee || transfer.issuerFee;
            transfer.transferFee = result.transferFee || transfer.transferFee;
            result.transferId = transfer.transferId;
            result[`transferId${type}`] = transfer.transferIdIssuer;
            transfer[`udf${type}`] = result.udfIssuer || {};

            return result;
        };

        const ledgerPushExecute = (transfer) => {
            if (!transfer.ledgerPort || transfer.issuerPort === transfer.ledgerPort) {
                return transfer;
            }
            return this.bus.importMethod('db/transfer.push.requestLedger')(transfer)
            .then(() => transfer)
            .then(this.bus.importMethod(transfer.ledgerPort + '.push.execute'))
            .then(result => {
                result.transferIdLedger = result.transferIdIssuer;
                transfer.acquirerFee = transfer.acquirerFee || result.issuerFee;
                return parseResult(transfer, result, 'Ledger');
            })
            .catch(handleError(transfer, 'Ledger'))
            .then(result => this.bus.importMethod('db/transfer.push.confirmLedger')({
                transferId: transfer.transferId,
                transferIdLedger: transfer.transferIdLedger,
                acquirerFee: transfer.acquirerFee,
                transferFee: transfer.transferFee,
                message: transfer.transferType,
                details: result
            }))
            .then(() => transfer);
        };

        const issuerPushExecute = (transfer) => {
            if (canSkip(transfer)) {
                return transfer;
            }
            if (!transfer.issuerPort) {
                throw errors.invalidIssuer();
            }
            return this.bus.importMethod('db/transfer.push.requestIssuer')({
                transferId: transfer.transferId,
                transferIdIssuer: transfer.transferIdIssuer,
                message: transfer.transferType,
                details: {
                    issuerSerialNumber: transfer.issuerSerialNumber
                }
            })
            .then(() => transfer)
            .then(this.bus.importMethod(transfer.issuerPort + '.push.execute'))
            .then(result => {
                if (transfer.transferType === 'ministatement') {
                    transfer.ministatement = result.ministatement;
                }
                transfer.balance = result.balance;
                transfer.issuerFee = transfer.issuerFee || result.issuerFee;
                transfer.issuerEmv = result.issuerEmv;

                return parseResult(transfer, result, 'Issuer');
            })
            .catch(handleError(transfer, 'Issuer'))
            .then(result => this.bus.importMethod('db/transfer.push.confirmIssuer')({
                transferId: transfer.transferId,
                transferIdIssuer: transfer.transferIdIssuer,
                issuerFee: transfer.issuerFee,
                transferFee: transfer.transferFee,
                message: transfer.transferType,
                details: result
            }))
            .then(() => transfer);
        };

        const merchantTransferExecute = (transfer) => {
            if (!transfer.merchantPort) {
                return transfer;
            }
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
        };

        return ruleValidate(this.bus, params)
            .then(dbPushExecute)
            .then(merchantTransferValidate)
            .then(ledgerPushExecute)
            .then(issuerPushExecute)
            .then(merchantTransferExecute);
    },
    'pending.pullExecute': function(params, $meta) {
        var preparePushExecuteParams = (securityCode) => {
            var transfer = Object.assign({}, params);
            transfer.isPending = true;
            transfer.transferPending.securityCode = securityCode && securityCode.value;
            transfer.transferPending.params = securityCode && securityCode.params;

            return transfer;
        };

        var pushExecute = (transfer) => this.config['transfer.push.execute'](transfer, $meta);

        return hashTransferPendingSecurityCode(this.bus, params)
            .then(preparePushExecuteParams)
            .then(pushExecute);
    },
    'pending.pushExecute': function(params, $meta) {
        var dbPendingPushExecute = (transfer) => {
            var method = `db/transfer.push.${transfer.pullTransferStatus}`;
            var $pendingPushExecuteMeta = Object.assign($meta, { method });
            return this.bus.importMethod($pendingPushExecuteMeta.method)({
                transferId: transfer.pullTransferId
            }, $pendingPushExecuteMeta)
                .then(() => {
                    return transfer;
                });
        };
        var getPullTransferInfo = (transfer, securityCode) => {
            return this.config['transfer.transfer.get']({ transferId: transfer.pullTransferId }, $meta)
                .then(pullTransfer => {
                    if (!pullTransfer || !pullTransfer.transferId) {
                        throw errors.notFound();
                    } else {
                        transfer.pullTransfer = pullTransfer;
                        transfer.sourceAccount = pullTransfer.sourceAccount;
                        transfer.destinationAccount = pullTransfer.destinationAccount;
                        transfer.amount = {
                            transfer: {
                                amount: pullTransfer.transferAmount,
                                currency: pullTransfer.transferCurrency
                            }
                        };

                        return transfer;
                    }
                });
        };
        var prepareParams = (transfer) => {
            return hashTransferPendingSecurityCode(this.bus, params)
                .then(securityCode => {
                    transfer.transferPending.securityCode = securityCode;
                    return transfer;
                });
        };
        var handlePendingTransfer = (transfer) => {
            transfer.pullTransferApprove = params.pullTransferApprove;
            if (transfer.pullTransferStatus === 'approve') { // Confirm pending transfer
                return this.config['transfer.push.execute'](transfer, $meta);
            } else if (transfer.pullTransferStatus === 'reject') { // Reject pending transfer
                var $transferRejectMeta = Object.assign($meta, { method: 'db/transfer.pending.reject' });
                return this.bus.importMethod($transferRejectMeta.method)({
                    transferId: params.pullTransferId,
                    userAvailableAccounts: params.userAvailableAccounts,
                    message: transfer.description,
                    reasonId: transfer.reasonId
                }, $transferRejectMeta)
                    .then(rejectResult => {
                        return transfer;
                    });
            } else if (transfer.pullTransferStatus === 'cancel') { // Cancel pending transfer
                var $transferCancelMeta = Object.assign($meta, {method: 'db/transfer.pending.cancel'});
                return this.bus.importMethod($transferCancelMeta.method)({
                    transferId: params.pullTransferId,
                    message: transfer.description,
                    reasonId: transfer.reasonsId
                }, $transferCancelMeta)
                    .then(rejectResult => {
                        return transfer;
                    });
            } else {
                throw errors.transferInvalidPendingTransfer();
            }
        };
        var handleError = (transfer) => error => {
            var $transferPushFailMeta = Object.assign($meta, {method: 'db/transfer.push.fail'});
            return this.bus.importMethod($transferPushFailMeta.method)({
                transferId: transfer.pullTransferId,
                type: error.type,
                message: error.message
            }, $transferPushFailMeta)
                .then(() => Promise.reject(error));
        };

        return dbPendingPushExecute(params)
            .then(getPullTransferInfo)
            .then(prepareParams)
            .then(handlePendingTransfer)
            .catch(handleError(params));
    },
    'idle.execute': function(params, $meta) {
        $meta.mtid = 'discard';
        return this.bus.importMethod('db/transfer.idle.execute')(params)
            .then(idleResult => {
                if (idleResult && idleResult.transferInfo && Array.isArray(idleResult.transferInfo) && idleResult.transferInfo.length > 0) {
                    let reversObj = Object.assign(idleResult.transferInfo[0], {split: idleResult.split});
                    return reversObj && reversObj.transferId && processReversal(this.bus, this.log, $meta)(reversObj);
                }
                return Promise.resolve();
            });
    },
    'push.reverse': function(params, $meta) {
        var getTransfer = (params) => this.config['transfer.transfer.get']({
            transferId: params.transferId,
            stan: params.stan,
            rrn: params.rrn,
            pan: params.pan,
            issuerId: params.issuerId,
            transferIdIssuer: params.transferIdIssuer,
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
            .then(processReversal(this.bus, this.log, $meta));
    },
    'card.execute': function(params, $meta) {
        if (params.abortAcquirer) {
            return this.bus.importMethod('transfer.push.execute')(params, $meta);
        } else {
            return this.bus.importMethod('db/atm.card.check[0]')({
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
            .then(result => {
                if (!result.issuerId) {
                    throw errors.unknownIssuer();
                }

                return result;
            })
            .catch(error => {
                params.abortAcquirer = error;
                return this.bus.importMethod('transfer.push.execute')(params, $meta);
            })
            .then(result => Object.assign(params, {
                cardProductName: result.cardProductName,
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
            .then(params => this.bus.importMethod('transfer.push.execute')(params, $meta));
        }
    },
    'transfer.get': function(msg, $meta) {
        var $getTransferMeta = Object.assign($meta, { method: 'db/transfer.transfer.get' });
        return this.bus.importMethod($getTransferMeta.method)(msg, $getTransferMeta)
            .then((dbResult) => {
                var transferResults = dbResult.transfer;
                var transferPending = dbResult.transferPending;
                var result = {};

                if (transferResults && Array.isArray(transferResults) && transferResults.length > 0) {
                    result = Object.assign({}, transferResults[0]);
                    result.split = dbResult.transferSplit;
                }
                if (transferResults && Array.isArray(transferPending) && transferPending.length > 0) {
                    result.pending = transferPending[0];
                }
                return result;
            });
    },
    'pendingUserTransfers.fetch': function(msg, $meta) {
        return this.bus.importMethod('db/transfer.pendingUserTransfers.fetch')(msg, $meta);
    }
};
// todo handle timeout from destination port
