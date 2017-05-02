import * as actionTypes from './actionTypes';

export const changeFilterStatus = (newValue) => ({
    type: actionTypes.CHANGE_FILTER_STATUS,
    params: newValue
});

export function fetchBatchStatuses(params) {
    return {
        type: actionTypes.FETCH_BATCH_STATUSES,
        method: 'bulk.batchStatus.fetch',
        params: params || {}
    };
}
