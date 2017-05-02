import {Map} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    item: Map({})
});

// const FINISHED = 'finished'

export const bulkBatchDetailEditPopup = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.SET_DETAIL_ITEM:
            return state.set('item', Map(action.params.item));
        case actionTypes.CHANGE_DETAIL_VALUE:
            return state.update('item', (v) => v.set(action.params.key, action.params.value));
        case actionTypes.REMOVE_DETAIL_ITEM:
            return state.set('item', defaultState.get('item'));
        case actionTypes.SAVE_EDIT_ITEM:
            return state.set('item', defaultState.get('item'));
        default:
            break;
    }
    return state;
};
