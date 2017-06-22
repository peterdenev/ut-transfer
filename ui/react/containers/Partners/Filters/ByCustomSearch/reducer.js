import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {CLEAR_FILTERS} from './../Clear/actionTypes';

const defaultState = Map({
    field: '',
    value: '',
    changeId: 0
});

export const transferPartnerFilterByCustomSearch = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.SET_FIELD:
            let oldChangeId = state.get('changeId');
            let newChangeId = state.get('value') !== '' ? ++oldChangeId : oldChangeId;
            return state
                .set('field', action.field)
                .set('changeId', newChangeId);
        case actionTypes.SET_VALUE:
            let oldId = state.get('changeId');
            let newId = state.get('field') !== '' ? ++oldId : oldId;
            return state
                .set('value', action.value)
                .set('changeId', newId);
        case CLEAR_FILTERS:
            return defaultState
                .set('changeId', state.get('changeId'));
    }
    return state;
};
