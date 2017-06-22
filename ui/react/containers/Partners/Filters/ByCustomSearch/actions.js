import * as actionTypes from './actionTypes';

export const setField = (field) => ({
    type: actionTypes.SET_FIELD, field
});

export const setValue = (value) => ({
    type: actionTypes.SET_VALUE, value
});
