import immutable from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = immutable.fromJS({
    changeId: 0
});

export function transferPartnerFilterClear(state = defaultState, action) {
    switch (action.type) {
        case actionTypes.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
