import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';
import * as clearFilterActions from '../ClearFilter/actionTypes';

const defaultState = Map({
    statusId: [],
    changeId: 0,
    paymentStatus: List()
});

export const bulkPaymentFilterStatus = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_FILTER_STATUS:
            return state
              .set('statusId', action.params)
              .update('changeId', (v) => ++v);
        case actionTypes.FETCH_BATCH_PAYMENT_STATUS:
            return state.set('paymentStatus', List(action.result));
        case clearFilterActions.CLEAR_PAYMENT_FILTER:
            return state
              .set('statusId', defaultState.get('statusId'))
              .set('changeId', defaultState.get('changeId'));
    }
    return state;
};
