import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from 'ut-front-react/constants';

const defaultState = immutable.fromJS({
    open: false,
    partnerData: {
        partnerId: '',
        name: '',
        port: '',
        mode: '',
        settlementDate: null,
        settlementAccount: null,
        feeAccount: null,
        commissionAccount: null,
        serialNumber: ''
    },
    errors: {},
    changeId: 0
});

export function transferPartnerCreate(state = defaultState, action) {
    switch (action.type) {
        case actionTypes.OPEN_CREATE_PARTNER_POPUP:
            return state
                .set('open', true);
        case actionTypes.CLOSE_CREATE_PARTNER_POPUP:
            return defaultState;
        case actionTypes.CHANGE_FIELD:
            let newState = state;
            if (action.data && action.data.errorMessage) {
                newState = newState.setIn(['errors', action.data.key], action.data.errorMessage);
            } else {
                newState = newState.deleteIn(['errors', action.key]);
            }
            return newState
                .setIn(['partnerData', action.key], action.value);
        case actionTypes.CREATE_PARTNER:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultState
                    .set('changeId', state.get('changeId') + 1);
            }
            break;
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params));
    }

    return state;
}
