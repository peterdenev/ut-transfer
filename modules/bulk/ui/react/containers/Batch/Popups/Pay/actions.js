import * as actionTypes from './actionTypes';

export function fetchAccounts(actorId) {
    return {
        type: actionTypes.FETCH_PAY_ACCOUNTS,
        method: 'bulk.account.fetch',
        params: {actorId}
    };
}

export function openPayPopup(batchId) {
    return {
        type: actionTypes.OPEN_PAY_BATCH_POPUP,
        params: {batchId}
    };
}

export function closePayPopup() {
    return {
        type: actionTypes.CLOSE_PAY_BATCH_POPUP,
        params: {}
    };
}

export function pay(batchId, expirationDate, account) {
    return {
        type: actionTypes.PAY_BATCH,
        method: 'bulk.batch.process',
        params: {batchId, expirationDate, account}
    };
}

export function changeExpirationDate(expirationDate) {
    return {
        type: actionTypes.CHANGE_EXPIRATION_DATE,
        params: {expirationDate}
    };
}

export function changePayAccount(account) {
    return {
        type: actionTypes.CHANGE_PAY_ACCOUNT,
        params: {account}
    };
}
