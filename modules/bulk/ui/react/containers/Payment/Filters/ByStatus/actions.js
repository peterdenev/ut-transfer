import * as actionTypes from './actionTypes';

export const changeFilterStatus = (newValue) => ({
    type: actionTypes.CHANGE_FILTER_STATUS,
    params: newValue
});

export function fetchBatchPaymentStatus(params) {
    return {
        type: actionTypes.FETCH_BATCH_PAYMENT_STATUS,
        method: 'bulk.paymentStatus.fetch',
        params: params || {}
    };
}
