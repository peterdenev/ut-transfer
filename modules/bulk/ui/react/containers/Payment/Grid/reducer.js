import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    data: List(),
    checkedRows: Map(),
    pagination: Map({
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    }),
    batch: Map(),
    changeId: 0
});

// const FINISHED = 'finished'

export const bulkPaymentGrid = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_BATCH_PAYMENTS:
            return state.set('data', List(action.result)).set('checkedRows', defaultState.get('checkedRows'));
        case actionTypes.GET_BATCH:
            return state.set('batch', Map(action.result));
        case actionTypes.PAYMENT_ROW_ADD_CHECK:
            return state.update('checkedRows', (value) => value.setIn([action.params.row.paymentId], action.params.row));
        case actionTypes.PAYMENT_ROW_REMOVE_CHECK:
            return state.update('checkedRows', (value) => value.delete(action.params.row.paymentId));
        case actionTypes.PAYMENT_ROW_SELECT:
            if (state.get('checkedRows').has(action.params.row.paymentId) && state.get('checkedRows').size === 1) {
                return state.set('checkedRows', Map());
            } else {
                return state.set('checkedRows', Map([[action.params.row.paymentId, action.params.row]]));
            }
        case actionTypes.PAYMENT_CHECK_ALL:
            if (state.get('checkedRows').size > 0) {
                return state.set('checkedRows', Map());
            } else {
                return state.set('checkedRows', new Map(action.params.rows.map((el) => ([el.paymentId, el]))));
            }
        default:
            break;
    }
    return state;
};
