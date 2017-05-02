import * as actionTypes from './actionTypes';

export const changeNameFilter = (newValue) => ({
    type: actionTypes.CHANGE_NAME_FILTER,
    params: newValue
});
