const DECLINED = {
    ledger: [
        'transfer.insufficientFunds',
        'transfer.invalidAccount',
        'transfer.inactiveAccount',
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
        'transfer.inactiveAccount',
        'transfer.creditAccountNotAllowed',
        'transfer.invalidCurrentAccount',
        'transfer.invalidSavingsAccount',
        'transfer.invalidAccountType',
        'transfer.genericDecline',
        'transfer.incorrectPin',
        'transfer.issuerNotConnected'
    ],
    merchant: ['merchant.genericDecline']
};
var currency = require('../../currency')();
var errors;

const processReversal = (bus, log, $meta, transfer) => {
    let {forward} = $meta;
    const reverse = (port, target) => {
        let method = `${port}.${transfer.transferType}.${transfer.operation}`;
        return bus.importMethod(method, {timeout: 30000})(transfer, $meta)
            .catch(error => {
                if (error.type === 'transfer.transferAlreadyReversed') {
                    return transfer;
                }
                throw error;
            })
            .then((result) => {
                transfer[`reversed${{Issuer: '', Ledger: 'Ledger'}[target]}`] = true;
                transfer.reversalResult = result;
                return bus.importMethod(`db/transfer.push.confirmReversal${target}`)({transferId: transfer.transferId, details: result}, {forward});
            })
            .then(() => transfer)
            .catch(reversalError => {
                let connected = !['port.notConnected', 'transfer.issuerNotConnected'].includes(reversalError && reversalError.type);
                return Promise.resolve(connected && bus.importMethod(`db/transfer.push.failReversal${target}`)({
                    transferId: transfer.transferId,
                    type: reversalError.type || (`${target.toLowerCase()}.error`),
                    message: reversalError.message,
                    details: reversalError
                }, {forward}))
                    .catch(error => {
                        if (error.type === 'transfer.transferAlreadyReversed') {
                            return transfer;
                        }
                        throw error;
                    })
                    .then(() => bus.importMethod(`db/transfer.push.confirmReversal${target}`)(transfer), {forward})
                    .then(() => {
                        transfer[`reversed${{Issuer: '', Ledger: 'Ledger'}[target]}`] = true;
                        return transfer;
                    })
                    .catch(reversalError => {
                        let connected = !['port.notConnected', 'transfer.issuerNotConnected'].includes(reversalError && reversalError.type);
                        return Promise.resolve(connected && bus.importMethod(`db/transfer.push.failReversal${target}`)({
                            transferId: transfer.transferId,
                            type: reversalError.type || (`${target.toLowerCase()}.error`),
                            message: reversalError.message,
                            details: reversalError
                        }, {forward}))
                            .catch(error => {
                                log.error && log.error(error);
                                return Promise.reject(reversalError);
                            })
                            .then(() => Promise.reject(reversalError));
                    });
            });
    };
    return bus.importMethod('db/transfer.push.reverse')(transfer, $meta).then(() => {
        transfer.operation = transfer.operation || 'reverse';
        transfer.transferType = transfer.transferType || 'push';
        transfer.amount = {
            transfer: currency.amount(transfer.transferCurrency, transfer.transferAmount)
        };
        if (transfer.udfAcquirer) {
            transfer.udfAcquirer.mti = transfer.mti;
        }
        let reverseIssuer = transfer.reverseIssuer && reverse(transfer.issuerPort, 'Issuer');
        let reverseLedger = transfer.reverseLedger && reverse(transfer.ledgerPort, 'Ledger');
        return Promise.all([reverseIssuer, reverseLedger])
            .then(() => transfer);
    });
};

const processAdjustment = (bus, log, $meta, transfer) => {
    let {forward} = $meta;
    const adjust = (port, target) => {
        let method = `${port}.${transfer.transferType}.${transfer.operation}`;
        return bus.importMethod(method, {timeout: 30000})(transfer, $meta)
            .then(result => bus.importMethod('db/transfer.push.confirmAdjustment')({
                transferId: transfer.transferId,
                source: target,
                replacementAmount: transfer.amount && transfer.amount.adjustment && transfer.amount.adjustment.amount,
                replacementAmountCurrency: transfer.amount && transfer.amount.adjustment && transfer.amount.adjustment.currency,
                actualAmount: result.amount && result.amount.actual && result.amount.actual.amount,
                actualAmountCurrency: result.amount && result.amount.actual && result.amount.actual.currency,
                transferIdIssuer: target === 'issuer' ? result.transferIdIssuer : undefined,
                transferIdLedger: target === 'ledger' ? result.transferIdIssuer : undefined,
                details: null
            }))
            .catch(adjustmentError => {
                return Promise.resolve(bus.importMethod(`db/transfer.push.failAdjustment`)({
                    transferId: transfer.transferId,
                    type: adjustmentError.type || (`${target}.error`),
                    message: adjustmentError.message,
                    source: target,
                    details: adjustmentError
                }, {forward}))
                    .catch(error => {
                        log.error && log.error(error);
                        return Promise.reject(adjustmentError);
                    })
                    .then(() => Promise.reject(adjustmentError));
            });
    };
    return bus.importMethod('db/transfer.push.adjust')(transfer, $meta).then(() => {
        transfer.operation = transfer.operation || 'adjust';
        transfer.transferType = transfer.transferType || 'push';
        if (transfer.udfAcquirer) {
            transfer.udfAcquirer.mti = transfer.mti;
        }
        let adjustIssuer = transfer.adjustIssuer && adjust(transfer.issuerPort, 'issuer');
        let adjustLedger = transfer.adjustLedger && adjust(transfer.ledgerPort, 'ledger');
        return Promise.all([adjustIssuer, adjustLedger])
            .then(() => transfer);
    });
};

const processAny = (bus, log, $meta) => transfer => {
    if (!transfer || !transfer.transferId) {
        return Promise.reject(errors['transfer.notFound']());
    }
    if (transfer.reversed && (transfer.issuerId === transfer.ledgerId || transfer.reversedLedger)) {
        return Promise.reject(errors['transfer.transferAlreadyReversed']());
    }
    return transfer.operation === 'adjust'
        ? processAdjustment(bus, log, $meta, transfer)
        : processReversal(bus, log, $meta, transfer);
};

var ruleValidate = (bus, transfer, forward) => {
    return Promise.resolve()
        .then(() => transfer.abortAcquirer && Promise.reject(transfer.abortAcquirer))
        .then(() => bus.importMethod('db/rule.decision.lookup')({
            channelId: transfer.channelId,
            operation: transfer.transferType,
            sourceAccount: transfer.sourceAccount,
            destinationAccount: transfer.destinationAccount,
            sourceCardProductId: transfer.sourceCardProductId,
            amount: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount,
            currency: transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency,
            isSourceAmount: false
        }, {forward})
            .then(decision => {
                transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
                transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
                if (decision.amount) {
                    transfer.acquirerFee = (decision.amount.acquirerFee === null ? transfer.acquirerFee : decision.amount.acquirerFee) || 0;
                    transfer.issuerFee = (decision.amount.issuerFee === null ? transfer.issuerFee : decision.amount.issuerFee) || 0;

                    transfer.processorFee = (decision.amount.processorFee === null ? transfer.processorFee : decision.amount.processorFee) || 0;
                    transfer.transferFee = transfer.acquirerFee + transfer.issuerFee + transfer.processorFee;

                    transfer.amount.acquirerFee = currency.amount(transfer.transferCurrency, transfer.acquirerFee);
                    transfer.amount.issuerFee = currency.amount(transfer.transferCurrency, transfer.issuerFee);
                    transfer.amount.processorFee = currency.amount(transfer.transferCurrency, transfer.processorFee);
                }
                transfer.transferDateTime = decision.amount && decision.amount.transferDateTime;
                transfer.transferTypeId = decision.amount && decision.amount.transferTypeId;
                transfer.split = decision.split;
                return transfer;
            }))
        .catch(error => {
            transfer.abortAcquirer = error;
            transfer.transferAmount = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.amount;
            transfer.transferCurrency = transfer.amount && transfer.amount.transfer && transfer.amount.transfer.currency;
            return bus.importMethod('db/rule.operation.lookup')({operation: transfer.transferType}, {forward})
                .then(result => {
                    transfer.transferDateTime = result && result.operation && result.operation.transferDateTime;
                    transfer.transferTypeId = result && result.operation && result.operation.transferTypeId;
                    return transfer;
                });
        });
};

var hashTransferPendingSecurityCode = (bus, transfer, forward) => {
    if (transfer.transferPending && transfer.pullTransfer && transfer.pullTransfer.pending && transfer.pullTransfer.pending.params && transfer.transferPending.securityCode) {
        return bus.importMethod('user.genHash')(transfer.transferPending.securityCode, JSON.parse(transfer.pullTransfer.pending.params), {forward});
    } else if (transfer.transferPending && transfer.transferPending.securityCode) {
        return bus.importMethod('user.getHash')({ value: transfer.transferPending.securityCode }, undefined, {forward});
    } else {
        return Promise.resolve(null);
    }
};

module.exports = function transferFlow({utError: {fetchErrors}}) {
    let transferHandlers = {
        start: function() {
            this.idlePorts = new Set();
            errors = fetchErrors('transfer');
        },
        'transferFlow.rule.validate': function(params, {forward}) {
            return ruleValidate(this.bus, params, forward);
        },
        'transferFlow.push.execute': function(params, $meta) {
            let {forward} = $meta;
            var handleError = (transfer, where) => error => {
                var method;
                if (where === 'Acquirer') {
                    method = this.bus.importMethod('db/transfer.push.abortAcquirer');
                } else if (error.reverse === false || DECLINED[where.toLowerCase()].includes(error && error.type)) {
                    method = this.bus.importMethod('db/transfer.push.fail' + where);
                } else {
                    method = this.bus.importMethod('db/transfer.push.reverse' + where);
                }
                let transferDetails = Object.assign({}, transfer, error.transferDetails);
                error = Object.assign(new Error(), error, {transferDetails});
                return method({
                    transferId: transfer.transferId,
                    source: where,
                    type: error.type || (where + '.error'),
                    message: error.message,
                    details: error
                }, {forward})
                    .catch(x => {
                        this.log.error && this.log.error(x);
                        return Promise.reject(error);
                    }) // .this is intentionally after catch as we do not want to this.log the original error
                    .then(x => Promise.reject(error));
            };
            var dbPushExecute = transfer => {
                switch (transfer.skipLedger) {
                    case 'ledgerAsIssuer':
                        transfer.ledgerId = transfer.issuerId;
                        break;
                }
                return this.bus.importMethod('db/transfer.push.create')(transfer, $meta)
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
                            throw errors['transfer.systemDecline']('transfer.push.create');
                        }
                    });
            };

            const merchantTransferValidate = (transfer) => {
                if (transfer.merchantPort) {
                    return this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'validate'].join('.'))(transfer, {forward})
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
                transfer.processorFee = result.processorFee || transfer.processorFee;
                transfer[`udf${type}`] = result.udfIssuer || {};
                result.transferId = transfer.transferId;

                return result;
            };

            const ledgerPushExecute = (transfer) => {
                if (transfer.skipLedger === true || (!transfer.ledgerPort || transfer.issuerPort === transfer.ledgerPort)) {
                    return transfer;
                }
                return this.bus.importMethod('db/transfer.push.requestLedger')(transfer, {forward})
                    .then(() => transfer)
                    .then(result => this.bus.importMethod(transfer.ledgerPort + '.push.execute')(result, {forward}))
                    .then(result => {
                        result.transferIdLedger = result.transferIdIssuer;
                        return parseResult(transfer, result, 'Ledger');
                    })
                    .catch(handleError(transfer, 'Ledger'))
                    .then(result => this.bus.importMethod('db/transfer.push.confirmLedger')({
                        transferId: transfer.transferId,
                        transferIdLedger: transfer.transferIdLedger,
                        acquirerFee: result.acquirerFee,
                        transferFee: result.transferFee,
                        processorFee: result.processorFee,
                        issuerFee: result.issuerFee,
                        message: transfer.transferType,
                        details: result
                    }, {forward}))
                    .then(() => transfer);
            };

            const issuerPushExecute = (transfer) => {
                if (canSkip(transfer)) {
                    return transfer;
                }
                if (!transfer.issuerPort) {
                    throw errors['transfer.invalidIssuer']();
                }
                return this.bus.importMethod('db/transfer.push.requestIssuer')({
                    transferId: transfer.transferId
                }, {forward})
                    .then(result => {
                        transfer.issuerRequestedDateTime = result[0][0].issuerRequestedDateTime;
                        return transfer;
                    })
                    .then(result => this.bus.importMethod(transfer.issuerPort + '.push.execute')(result, {forward}))
                    .then(result => {
                        if (transfer.transferType === 'ministatement') {
                            transfer.ministatement = result.ministatement;
                        }
                        transfer.balance = result.balance;
                        transfer.issuerEmv = result.issuerEmv;
                        transfer.retrievalReferenceNumber = result.retrievalReferenceNumber;
                        transfer.settlementDate = result.settlementDate;
                        transfer.actualAmount = result.amount && result.amount.actual && result.amount.actual.amount;
                        transfer.actualAmountCurrency = result.amount && result.amount.actual && result.amount.actual.currency;
                        return parseResult(transfer, result, 'Issuer');
                    })
                    .catch(handleError(transfer, 'Issuer'))
                    .then(result => this.bus.importMethod('db/transfer.push.confirmIssuer')({
                        transferId: transfer.transferId,
                        transferIdIssuer: transfer.transferIdIssuer,
                        acquirerFee: result.acquirerFee,
                        transferFee: result.transferFee,
                        processorFee: result.processorFee,
                        issuerFee: result.issuerFee,
                        actualAmount: result.amount && result.amount.actual && result.amount.actual.amount,
                        actualAmountCurrency: result.amount && result.amount.actual && result.amount.actual.currency,
                        retrievalReferenceNumber: transfer.retrievalReferenceNumber,
                        settlementDate: transfer.settlementDate,
                        message: transfer.transferType,
                        details: result
                    }, {forward}))
                    .then(() => transfer);
            };

            const merchantTransferExecute = (transfer) => {
                if (!transfer.merchantPort) {
                    return transfer;
                }
                return this.bus.importMethod('db/transfer.push.requestMerchant')(transfer, {forward})
                    .then(() => transfer)
                    .then(result => this.bus.importMethod([transfer.merchantPort, transfer.transferType, 'execute'].join('.'))(result, {forward}))
                    .then(merchantResult => {
                        transfer.transferIdMerchant = merchantResult.transferIdMerchant;
                        merchantResult.transferId = transfer.transferId;
                        merchantResult.transferIdMerchant = transfer.transferIdMerchant;
                        return merchantResult;
                    })
                    .catch(handleError(transfer, 'Merchant'))
                    .then(result => this.bus.importMethod('db/transfer.push.confirmMerchant')(result, {forward}))
                    .then(() => transfer);
            };

            return ruleValidate(this.bus, params, forward)
                .then(dbPushExecute)
                .then(merchantTransferValidate)
                .then(ledgerPushExecute)
                .then(issuerPushExecute)
                .then(merchantTransferExecute);
        },
        'transferFlow.pending.pullExecute': function(params, $meta) {
            let {forward} = $meta;
            var preparePushExecuteParams = (securityCode) => {
                var transfer = Object.assign({}, params);
                transfer.isPending = true;
                transfer.transferPending.securityCode = securityCode && securityCode.value;
                transfer.transferPending.params = securityCode && securityCode.params;

                return transfer;
            };

            var pushExecute = (transfer) => transferHandlers['transferFlow.push.execute'].call(this, transfer, $meta);

            return hashTransferPendingSecurityCode(this.bus, params, forward)
                .then(preparePushExecuteParams)
                .then(pushExecute);
        },
        'transferFlow.pending.pushExecute': function(params, $meta) {
            let {forward} = $meta;
            var dbPendingPushExecute = (transfer) => {
                return this.bus.importMethod(`db/transfer.push.${transfer.pullTransferStatus}`)({
                    transferId: transfer.pullTransferId
                }, $meta)
                    .then(() => {
                        return transfer;
                    });
            };
            var getPullTransferInfo = (transfer, securityCode) => {
                return transferHandlers['transferFlow.transfer.get'].call(this, { transferId: transfer.pullTransferId }, $meta)
                    .then(pullTransfer => {
                        if (!pullTransfer || !pullTransfer.transferId) {
                            throw errors['transfer.notFound']();
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
                return hashTransferPendingSecurityCode(this.bus, params, forward)
                    .then(securityCode => {
                        transfer.transferPending.securityCode = securityCode;
                        return transfer;
                    });
            };
            var handlePendingTransfer = (transfer) => {
                transfer.pullTransferApprove = params.pullTransferApprove;
                if (transfer.pullTransferStatus === 'approve') { // Confirm pending transfer
                    return transferHandlers['transferFlow.push.execute'].call(this, transfer, $meta);
                } else if (transfer.pullTransferStatus === 'reject') { // Reject pending transfer
                    return this.bus.importMethod('db/transfer.pending.reject')({
                        transferId: params.pullTransferId,
                        userAvailableAccounts: params.userAvailableAccounts,
                        message: transfer.description,
                        reasonId: transfer.reasonId
                    }, $meta)
                        .then(rejectResult => {
                            return transfer;
                        });
                } else if (transfer.pullTransferStatus === 'cancel') { // Cancel pending transfer
                    return this.bus.importMethod('db/transfer.pending.cancel')({
                        transferId: params.pullTransferId,
                        message: transfer.description,
                        reasonId: transfer.reasonsId
                    }, $meta)
                        .then(rejectResult => {
                            return transfer;
                        });
                } else {
                    throw errors['transfer.transferInvalidPendingTransfer']();
                }
            };
            var handleError = (transfer) => error => {
                return this.bus.importMethod('db/transfer.push.fail')({
                    transferId: transfer.pullTransferId,
                    type: error.type,
                    message: error.message
                }, $meta)
                    .then(() => Promise.reject(error));
            };

            return dbPendingPushExecute(params)
                .then(getPullTransferInfo)
                .then(prepareParams)
                .then(handlePendingTransfer)
                .catch(handleError(params));
        },
        'transferFlow.idle.execute': function(params, $meta) {
            $meta.mtid = 'discard';
            params && params.issuerPort && this.idlePorts.add(params.issuerPort);
            if (this.idleExecuting) {
                return false;
            } else {
                let ports = Array.from(this.idlePorts).map(value => ({value}));
                this.idlePorts.clear();
                let finish = () => {
                    this.idleExecuting = false;
                    this.idlePorts.size && this.publish({}, {mtid: 'notification', method: 'transferFlow.idle.execute'});
                };
                this.idleExecuting = true;
                Promise.resolve()
                    .then(() => this.bus.importMethod('db/transfer.idle.execute')({
                        count: 10,
                        ports
                    }, {forward: $meta.forward}))
                    .then(idleResult => {
                        if (idleResult && idleResult.transferInfo && Array.isArray(idleResult.transferInfo) && idleResult.transferInfo.length > 0) {
                            let reverse = processAny(this.bus, this.log, $meta);
                            return Promise.all(idleResult.transferInfo.map(transfer => {
                                transfer.split = (idleResult.split || []).filter(split => split.transferId === transfer.transferId);
                                return reverse(transfer);
                            }));
                        }
                        return false;
                    })
                    .then(finish)
                    .catch(error => {
                        this.error(error);
                        finish();
                    })
                    .catch(error => this.error(error));
                return true;
            }
        },
        'transferFlow.push.reverse': function(params, $meta) {
            var getTransfer = (params) => transferHandlers['transferFlow.transfer.get'].call(this, {
                transferId: params.transferId,
                transferIdAcquirer: params.transferIdAcquirer,
                retrievalReferenceNumber: params.retrievalReferenceNumber,
                pan: params.pan,
                issuerId: params.issuerId,
                transferIdIssuer: params.transferIdIssuer,
                acquirerCode: params.acquirerCode,
                cardId: params.cardId,
                localDateTime: params.localDateTime
            }, $meta)
                .then(result => {
                    if (!result || !result.transferId) {
                        throw errors['transfer.notFound']();
                    } else {
                        var transferInfo = Object.assign({
                            message: params.message,
                            mti: '430',
                            operation: (params.amount && params.amount.adjustment && params.amount.adjustment.cents)
                                ? 'adjust'
                                : 'reverse',
                            transferType: 'push',
                            amount: params.amount
                        }, result, {originatorInfo: params});
                        return transferInfo;
                    }
                });

            return getTransfer(params)
                .then(transfer => {
                    return processAny(this.bus, this.log, $meta)(transfer)
                        .catch(error => {
                            if (error instanceof errors['transfer.transferAlreadyReversed']) {
                                return transfer;
                            }
                            throw error;
                        });
                });
        },
        'transferFlow.card.execute': function(params, $meta) {
            let {forward} = $meta;
            if (params.abortAcquirer) {
                return this.bus.importMethod('transferFlow.push.execute')(params, $meta);
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
                }, {forward})
                    .then(result => {
                        if (!result.issuerId) {
                            throw errors['transfer.unknownIssuer']();
                        }

                        return result;
                    })
                    .catch(error => {
                        params.abortAcquirer = error;
                        return this.bus.importMethod('transferFlow.push.execute')(params, $meta);
                    })
                    .then(result => Object.assign(params, {
                        cardProductName: result.cardProductName,
                        sourceAccount: result.sourceAccountNumber,
                        sourceAccountName: result.sourceAccountName,
                        destinationAccount: result.destinationAccountNumber,
                        sourceCardProductId: result.sourceCardProductId,
                        destinationAccountName: result.destinationAccountName,
                        issuerId: result.issuerId,
                        ledgerId: result.ledgerId,
                        cardNumber: result.cardNumber,
                        ordererId: result.ordererId
                    }))
                    .then(result => !params.transferIdAcquirer && this.bus.importMethod(`db/${params.channelType}.terminal.nextId`)({
                        channelId: result.channelId
                    }, {forward}))
                    .then(result => {
                        if (params.transferIdAcquirer) {
                            return params;
                        }
                        if (!result || !result[0] || !result[0][0] || !result[0][0].tsn) {
                            throw errors['transfer.nextId']();
                        }
                        params.transferIdAcquirer = result[0][0].tsn;
                        return params;
                    })
                    .then(params => this.bus.importMethod('transferFlow.push.execute')(params, $meta));
            }
        },
        'transferFlow.transfer.get': function(msg, $meta) {
            return this.bus.importMethod('db/transfer.transfer.get')(msg, $meta)
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
        'transferFlow.pendingUserTransfers.fetch': function(msg, $meta) {
            return this.bus.importMethod('db/transfer.pendingUserTransfers.fetch')(msg, $meta);
        }
    };
    // todo handle timeout from destination port

    return transferHandlers;
};
