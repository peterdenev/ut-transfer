import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import * as clearFilterActions from '../ClearFilter/actionTypes';

const defaultState = Map({
    field: 'name',
    value: '',
    changeId: 0
});

export const bulkPaymentFilterCustom = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_FILTER_CUSTOM_FIELD:
            return state
                        .set('field', action.params.value);
        case actionTypes.CHANGE_FILTER_CUSTOM_VALUE:
            return state
                        .set('value', action.params.value)
                        .update('changeId', (v) => ++v);
        case clearFilterActions.CLEAR_PAYMENT_FILTER:
            return defaultState;
    }
    return state;
};
