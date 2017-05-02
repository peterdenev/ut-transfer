import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import * as clearFilterActions from '../ClearFilter/actionTypes';

const defaultState = Map({
    batchName: '',
    changeId: 0
});

export const bulkBatchFilterName = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_NAME_FILTER:
            return state
              .set('batchName', action.params)
              .update('changeId', (v) => ++v);
        case clearFilterActions.CLEAR_BATCH_FILTER:
            return defaultState;
    }
    return state;
};
