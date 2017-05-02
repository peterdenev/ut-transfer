import * as actionTypes from './actionTypes';

export const changeFilterDate = (newDate) => ({
    type: actionTypes.CHANGE_FILTER_DATE,
    params: {newDate}
});
