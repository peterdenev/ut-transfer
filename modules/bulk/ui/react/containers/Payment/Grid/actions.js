import * as actionTypes from './actionTypes';

export function fetchBatchPayments(params) {
    return {
        type: actionTypes.FETCH_BATCH_PAYMENTS,
        method: 'bulk.payment.fetch',
        params: params || {}
    };
}

export function getBatch(params) {
    return {
        type: actionTypes.GET_BATCH,
        method: 'bulk.batch.get',
        params: params || {}
    };
}

export function checkRow(row) {
    return {
        type: actionTypes.PAYMENT_ROW_ADD_CHECK,
        params: {row} || {}
    };
}

export function uncheckRow(row) {
    return {
        type: actionTypes.PAYMENT_ROW_REMOVE_CHECK,
        params: {row} || {}
    };
}

export function selectRow(row) {
    return {
        type: actionTypes.PAYMENT_ROW_SELECT,
        params: {row} || {}
    };
}

export function checkAll(rows) {
    return {
        type: actionTypes.PAYMENT_CHECK_ALL,
        params: {rows} || {}
    };
}
