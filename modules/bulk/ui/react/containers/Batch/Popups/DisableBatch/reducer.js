import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    batchId: null,
    comment: null,
    batchStatuses: List(),
    changeId: 0
});

export const bulkBatchDisablePopup = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.DISABLE_BATCH:
            return state.set('batchId', action.params.batchId).update('changeId', (value) => ++value);
        case actionTypes.OPEN_DISABLE_BATCH_POPUP:
            return state.set('batchId', action.params.batchId);
        case actionTypes.CLOSE_DISABLE_BATCH_POPUP:
            return state.set('batchId', null).set('comment', null);
        case actionTypes.ADD_COMMENT:
            return state.set('comment', action.params.comment);
        case actionTypes.LOAD_BATCH_STATUSES:
            return state.set('batchStatuses', List(action.result));
        default:
            break;
    }
    return state;
};
