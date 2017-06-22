import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from 'ut-front-react/constants';

const defaultState = immutable.fromJS({
    open: false,
    remoteData: {},
    data: {},
    errors: {},
    changeId: 0
});

export function transferPartnerDetails(state = defaultState, action) {
    switch (action.type) {
        case actionTypes.CLOSE_DETAILS_POPUP:
            return defaultState;
        case actionTypes.FETCH_PARTNER_DETAILS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let newData = immutable.fromJS(action.result.partner[0]);
                let newState = defaultState
                    .set('open', true)
                    .set('data', newData)
                    .set('remoteData', newData);
                return newState;
            }
            break;
        case actionTypes.CHANGE_FIELD:
            let newState = state;
            if (action.data && action.data.errorMessage) {
                newState = newState.setIn(['errors', action.data.key], action.data.errorMessage);
            } else {
                newState = newState.deleteIn(['errors', action.key]);
            }
            return newState
                .setIn(['data', action.key], action.value);
        case actionTypes.EDIT_PARTNER_DETAILS:
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
