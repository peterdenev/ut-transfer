import * as actionTypes from './actionTypes';

export function rejectBatch(batchId, actorId, statusId, comment) {
    return {
        type: actionTypes.REJECT_BATCH,
        method: 'bulk.batch.edit',
        params: {
            batchId: batchId,
            actorId: actorId,
            batchStatusId: statusId,
            batchInfo: comment
        }
    };
}

export function openRejectBatchPopup(batchId) {
    return {
        type: actionTypes.OPEN_REJECT_BATCH_POPUP,
        params: {batchId}
    };
}

export function closeRejectBatchPopup() {
    return {
        type: actionTypes.CLOSE_REJECT_BATCH_POPUP,
        params: {}
    };
}

export function addComment(comment) {
    return {
        type: actionTypes.ADD_COMMENT_REJECT,
        params: {comment}
    };
}

export function loadBatchStatuses(params) {
    return {
        type: actionTypes.LOAD_BATCH_STATUSES_REJECT,
        method: 'bulk.batchStatus.fetch',
        params: params || {}
    };
}
