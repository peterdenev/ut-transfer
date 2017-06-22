import * as actionTypes from './actionTypes';

export function updatePagination(params) {
    return {
        type: actionTypes.UPDATE_PAGINATION,
        params: params
    };
}
