import * as actionTypes from './actionTypes';

export function disableBatch(batchId, actorId, statusId, comment) {
    return {
        type: actionTypes.DISABLE_BATCH,
        method: 'bulk.batch.edit',
        params: {
            batchId: batchId,
            actorId: actorId,
            batchStatusId: statusId,
            batchInfo: comment
        }
    };
}

export function openDisablePopup(batchId) {
    return {
        type: actionTypes.OPEN_DISABLE_BATCH_POPUP,
        params: {batchId}
    };
}

export function closeDisablePopup() {
    return {
        type: actionTypes.CLOSE_DISABLE_BATCH_POPUP,
        params: {}
    };
}

export function addComment(comment) {
    return {
        type: actionTypes.ADD_COMMENT,
        params: {comment}
    };
}

export function loadBatchStatuses(params) {
    return {
        type: actionTypes.LOAD_BATCH_STATUSES,
        method: 'bulk.batchStatus.fetch',
        params: params || {}
    };
}
