import * as actionTypes from './actionTypes';

export const changeFilterDate = (field, newDate) => ({
    type: actionTypes.CHANGE_FILTER_DATE,
    params: {field, newDate}
});
