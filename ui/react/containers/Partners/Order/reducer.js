import {Map} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    changeId: 0,
    fields: Map({})
});

export const transferPartnersGridOrder = (state = defaultState, action) => {
    if (action.type === actionTypes.ORDER && action.params) {
        if (!action.params.state || action.params.state === '') {
            return state
                .update('changeId', (v) => (v + 1))
                .deleteIn(['fields', action.params.field]);
        } else {
            return state
                .update('changeId', (v) => (v + 1))
                .set('fields', Map({[action.params.field]: action.params.state}));
        }
    }

    return state;
};
