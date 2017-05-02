import * as actionTypes from './actionTypes';

export const changeFilterCustomField = (value) => ({
    type: actionTypes.CHANGE_FILTER_CUSTOM_FIELD,
    params: {value}
});

export const changeFilterCustomValue = (value) => ({
    type: actionTypes.CHANGE_FILTER_CUSTOM_VALUE,
    params: {value}
});
