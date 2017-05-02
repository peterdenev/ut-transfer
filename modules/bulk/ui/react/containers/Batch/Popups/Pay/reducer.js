import {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    batchId: null,
    accounts: List(),
    expirationDate: null,
    selectedAccount: null
});

export const bulkBatchPayPopup = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.OPEN_PAY_BATCH_POPUP:
            return state.set('batchId', action.params.batchId);
        case actionTypes.CLOSE_PAY_BATCH_POPUP:
            return state.set('batchId', defaultState.get('batchId'));
        case actionTypes.CHANGE_EXPIRATION_DATE:
            return state.set('expirationDate', action.params.expirationDate);
        case actionTypes.CHANGE_PAY_ACCOUNT:
            return state.set('selectedAccount', action.params.account);
        case actionTypes.FETCH_PAY_ACCOUNTS:
            if (action.result) {
                return state.set('accounts', List(action.result.map(account => ({key: account.id, name: account.name}))));
            } else {
                return state.set('accounts', defaultState.get('accounts'));
            }
        default:
            break;
    }
    return state;
};
