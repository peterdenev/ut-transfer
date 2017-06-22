import * as actionTypes from './actionTypes';

export const order = (field, state) => ({
    type: actionTypes.ORDER,
    params: {
        field,
        state
    }
});
