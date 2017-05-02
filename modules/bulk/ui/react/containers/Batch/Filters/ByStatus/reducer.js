import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';
import * as clearFilterActions from '../ClearFilter/actionTypes';

const defaultState = Map({
    statusId: '__placeholder__',
    changeId: 0,
    batchStatuses: List()
});

export const bulkBatchFilterStatus = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_FILTER_STATUS:
            return state
              .set('statusId', action.params)
              .update('changeId', (v) => ++v);
        case actionTypes.FETCH_BATCH_STATUSES:
            return state.set('batchStatuses', List(action.result));
        case clearFilterActions.CLEAR_BATCH_FILTER:
            return state
              .set('statusId', null)
              .set('changeId', 0);
    }
    return state;
};
