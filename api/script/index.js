const DECLINED = {
    ledger: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    issuer: ['transfer.insufficientFunds', 'transfer.invalidAccount', 'transfer.genericDecline', 'transfer.incorrectPin'],
    merchant: ['merchant.genericDecline', 'merchant.invalidMerchant']
};
var errors = require('../../errors');
var currency = require('../../currency');

// ---------------------Added----------------------
var addOriginalRequestProperty = (transfer) => {
    if (!transfer.originalRequest){
        transfer.originalRequest = Object.assign({},transfer);
        delete transfer.originalRequest.pan;
        transfer.originalRequest = JSON.stringify(transfer.originalRequest);
    }
    return Promise.resolve(transfer);
};
var processReversal = (bus, log, $meta) => params => {
    var transferId;
    var partialTransferId;
    var mcResponse;

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
        // ---------------------Added-------------------------
        // Delete the added property because is no longer need it
        if (reversal.originalRequest) {
            delete reversal.originalRequest;
        }
        // -------------------------------------------
        transferId = reversal.transferId;
        if (reversal && !reversal.reversed) { // reverse only transaction that have NOT been reversed
            reversal.udfAcquirer && (reversal.udfAcquirer.mti = reversal.mti);
            reversal.amount = {
                transfer: currency.amount(reversal.transferCurrency, reversal.transferAmount)
            };

            // ---------------------Changed----------------------
            if (reversal.replacementAmount != null) { // if any replacement amount is present
                reversal.amount.replacement = currency.amount(reversal.transferCurrency, reversal.replacementAmount);
            }
            // -------------------------------------------
            // prepare reversal object for postReversal
            if (!reversal.operation) {
                reversal.operation = 'reverse';
            }
            if (!reversal.transferType) {
                reversal.transferType = 'push';
            }

            return reversal && portReversal(reversal.issuerPort, reversal)
            .then(result => {
                    // ---------------------Added----------------------
                    mcResponse = JSON.stringify(result.mcResponse);
                    // -------------------------------------------
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
        // ---------------------Changed and Added----------------------
        var isPartialReversal;
        if (reversalResult.isPartialReversal) {
            isPartialReversal = reversalResult.isPartialReversal;
        } else {
            isPartialReversal = null;
        }
        // -------------Added------------------------------
        if (partialTransferId) {
            return bus.importMethod('db/transfer.push.confirmPartialReversal')({
                partialTransferId,
                mcResponse
            })
            .then(transferId && bus.importMethod('db/transfer.push.confirmReversal')({
                transferId,
                isPartialReversal
            }))
            .then(function(confirmReversalResult) {
                return reversalResult;
            });
        }
        // return transferId && bus.importMethod('db/transfer.push.confirmReversal')({transferId})
        // -------------
        return transferId && bus.importMethod('db/transfer.push.confirmReversal')({transferId, isPartialReversal})
        .then(function(confirmReversalResult) {
            return reversalResult;
        });
            // -------------------------------------------
    ;

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
     // ---------------------Added----------------------
     var partialReversal = reversal => {
        if (reversal.isPartialReversal && reversal.isPartialReversal == 1) {
            return Promise.resolve(bus.importMethod('db/transfer.push.partialReversal')(reversal, $meta))
                .then(result => {
                    partialTransferId = result[0][0].transferId;
                    return reversal;
                });
        } else {
            return reversal;
        }
    };
     // ---------------------Added----------------------
    var validateAmount = reversal => {
        var replacementAmount = reversal.replacementAmount;
        var transferIdAux = reversal.transferId;
        return transferIdAux && bus.importMethod('db/transfer.push.validateAmount')({
            transferIdAux,
            replacementAmount,
            type: reversal.type || ('issuer.error'),
            message: reversal.message,
            details: reversal
        })
        .then(result => {
            if (result.length > 0) {
                reversal.transferAmount = result[0][0].transferAmount;
                if (reversal.transferAmount == reversal.replacementAmount) {
                    reversal.isPartialReversal = 0;
                    reversal.replacementAmount = 0;
                }
                return reversal;
            } else {
                // TODO: suggestion (create its own error)
                throw errors.transferAlreadyReversed();
            }
        });
    };

    return dbPushReverse(params)
     // ---------------------Added----------------------
        .then(validateAmount)
        .then(addOriginalRequestProperty)
        .then(partialReversal)
 //-------------------------------------------
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
            } else if (where === 'Issuer') {
                method = this.bus.importMethod('db/transfer.push.failIssuer');
            } else {
                method = this.bus.importMethod('db/transfer.push.fail');
            }
            // else if (DECLINED[where.toLowerCase()].includes(error && error.type)) {
            //     method = this.bus.importMethod('db/transfer.push.fail' + where);
            // } else {
            //     method = this.bus.importMethod('db/transfer.push.reverse' + where);
            // }
            return method({
                transferId: transfer.transferId,
                source: where,
                type: error.type || (where + '.error'),
                message: error.message,
                details: Object.assign({}, error, {transferDetails: transfer}),
                issuerResponseCode: error.issuerResponseCode,
                issuerResponseMessage: error.issuerResponseMessage
            })
            .catch(x => {
                this.log.error && this.log.error(x);
                return Promise.reject(error);
            }) // .this is intentionally after catch as we do not want to this.log the original error
            .then(x => Promise.reject(error));
        };
        var dbPushExecute = transfer => this.bus.importMethod('db/transfer.push.create')(transfer, Object.assign($meta, {method: 'db/transfer.push.create'}))
            .then(pushResult => {
                // ---------------------Added----------------------
                // ---- Delete the added property because is no longer need it
                if (transfer.originalRequest) {
                    delete transfer.originalRequest;
                }
                if (transfer.originalTransferId) {
                    delete transfer.originalTransferId;
                }
                // -------------------------------------------
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
                ((transfer.transferType === 'sms') && (transfer.issuerFee === 0)) ||
                (transfer.transferType === 'tia');
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

                        // ---------------------Added----------------------
                        if (result.mcResponse) {
                            result.mcResponse = JSON.stringify(result.mcResponse);
                        }
                        // -------------------------------------------
                        return result;
                    })
                    .catch(handleError(transfer, 'Issuer'))
                    // ---------------------Added----------------------
                    .then(this.bus.importMethod('db/transfer.push.saveResponse'))
                    .then(() => transfer)
                    // -------------------------------------------
                    .then(this.bus.importMethod('db/transfer.push.confirmIssuer'))
                    // ---------------------Added----------------------
                    .then(transfer => {
                        // Delete the added property in order to not to show it in the response
                        if (transfer.mcResponse) {
                            delete transfer.mcResponse;
                        }
                        return transfer;
                    })
                    // -------------------------------------------
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
        // ---------------------Added----------------------
        var incrementalAuthorization = (transfer) => {
            if (transfer.isIncrementalAuthorization && transfer.isIncrementalAuthorization != 0) {
                var getTransfer = (transfer) => this.config['transfer.transfer.get']({
                    transferId: transfer.transferId,
                    transferIdAcquirer: null,
                    acquirerCode: transfer.acquirerCode,
                    cardId: transfer.cardId,
                    localDateTime: transfer.localDateTime
                }, $meta)
                .then(result => {
                    if (!result || !result.transferId) {
                        throw errors.notFound();
                    } else {
                        transfer.originalTransferId = transfer.transferId;
                        transfer.udfAcquirer.privateData = result.udfAcquirer.privateData +
                        '6315' + result.networkData + result.issuerSettlementDate.substring(5, 10).replace('-', '') + '   ';
                        return transfer;
                    }
                });
                return getTransfer(transfer);
            } else {
                return transfer;
            }
        };
        // -------------------------------------------------

        return ruleValidate(this.bus, params)
        // ---------------------Added----------------------
            .then(incrementalAuthorization)
            .then(addOriginalRequestProperty)
    // -------------------------------------------
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
                    mti: params.udfAcquirer.mti,
                    udfAcquirer: params.udfAcquirer,
                    operation: 'reverse',
                    transferType: 'push',
                    pan: params.pan,
                    responseCode: params.responseCode,
                    replacementAmount: params.amount && params.amount.replacement && params.amount.replacement.amount, // Shashi
                    originalParams: params.originalParams,
                    stan: params.stan,
                    localDateTime: params.localDateTime,
                    isPartialReversal: params.isPartialReversal
                }, result);
                // ---------------------Added----------------------
                if (transferInfo.isPartialReversal && transferInfo.isPartialReversal == 1) {
                    var currentAmount = currency.cents(params.currency, params.amount.transfer.amount, 1);
                    var replacementAmount = currency.cents(transferInfo.transferCurrency, transferInfo.replacementAmount, 1);
                    // Check the amounts
                    // TODO: Create its own error to this condition.
                    if ((parseInt(currentAmount.amount) < parseInt(replacementAmount.amount)) &&
                    (parseInt(currentAmount.cents) < parseInt(replacementAmount.cents))) {
                        throw errors.transferAlreadyReversed();
                    }
                }
                // ---------------------Changed----------------------
                transferInfo.udfAcquirer.privateData = params.udfAcquirer.privateData + '2001S' +
                '6315' + transferInfo.networkData + transferInfo.issuerSettlementDate.substring(5, 10).replace('-', '');
                // Add DE 90 (Original Params)
                transferInfo.originalParams = '0' + transferInfo.udfAcquirer.mti + transferInfo.stan + transferInfo.localDateTime +
                ('0000000000' + transferInfo.acquirerCode).slice(-11) + '00000000000';
                // ------------------------------------------------------
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
            return this.bus.importMethod('card.card.check')({
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
                return this.bus.importMethod('transfer.push.execute')(params, $meta);
            })
            .then((r) => {
                return r.result;
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
