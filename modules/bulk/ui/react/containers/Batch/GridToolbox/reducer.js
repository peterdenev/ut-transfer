import {Map} from 'immutable';
import actionTypes from './actionTypes';

const defaultState = Map({
    changeId: 0,
    filters: Map({opened: true}),
    buttons: Map({opened: false})
});

export const bulkBatchToolbox = (state = defaultState, action) => {
    if (action.type === actionTypes.TOGGLE) {
        return state
                .updateIn(['filters', 'opened'], (v) => (!v))
                .updateIn(['buttons', 'opened'], (v) => (!v));
    } else if (action.type === actionTypes.SHOW_BUTTONS) {
        return state
                .setIn(['filters', 'opened'], false)
                .setIn(['buttons', 'opened'], true);
    } else if (action.type === actionTypes.SHOW_FILTERS) {
        return state
                .setIn(['buttons', 'opened'], false)
                .setIn(['filters', 'opened'], true);
    }
    return state;
};
