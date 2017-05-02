import * as actionTypes from './actionTypes';

export function deleteBatch(batchId, actorId, statusId, comment) {
    return {
        type: actionTypes.DELETE_BATCH,
        method: 'bulk.batch.edit',
        params: {
            batchId: batchId,
            actorId: actorId,
            batchStatusId: statusId,
            batchInfo: comment
        }
    };
}

export function openDeletePopup(batchId) {
    return {
        type: actionTypes.OPEN_DELETE_BATCH_POPUP,
        params: {batchId}
    };
}

export function closeDeletePopup() {
    return {
        type: actionTypes.CLOSE_DELETE_BATCH_POPUP,
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
        type: actionTypes.LOAD_BATCH_STATUSES_DELETE,
        method: 'bulk.batchStatus.fetch',
        params: params || {}
    };
}
