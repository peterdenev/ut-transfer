import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    batchId: null,
    comment: null,
    batchStatuses: List()
});

export const bulkBatchRejectPopup = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.REJECT_BATCH:
            return state.set('batchId', action.params.batchId);
        case actionTypes.OPEN_REJECT_BATCH_POPUP:
            return state.set('batchId', action.params.batchId);
        case actionTypes.CLOSE_REJECT_BATCH_POPUP:
            return state.set('batchId', null).set('comment', null);
        case actionTypes.ADD_COMMENT_REJECT:
            return state.set('comment', action.params.comment);
        case actionTypes.LOAD_BATCH_STATUSES_REJECT:
            return state.set('batchStatuses', List(action.result));
        default:
            break;
    }
    return state;
};
