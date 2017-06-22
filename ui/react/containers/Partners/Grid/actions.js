import * as actionTypes from './actionTypes';

export function fetchPartners(filterBy = {}, orderBy = [], paging = {}) {
    return {
        type: actionTypes.FETCH_PARTNERS,
        method: 'transfer.partner.fetch',
        params: {
            filterBy,
            orderBy,
            paging
        }
    };
}
export function setVisibleColumns() {
    return {
        type: actionTypes.SET_VISIBLE_COLUMNS
    };
}

export function toggleVisibleColumn(field) {
    return {
        type: actionTypes.TOGGLE_VISIBLE_COLUMN,
        field
    };
};

export function checkPartner(rowIdx, row, state) {
    return {
        type: actionTypes.CHECK_PARTNER,
        params: {
            rowIdx,
            row,
            state
        }
    };
}

export const cleanAndCheck = (rowIdx, row, state) => ({
    type: actionTypes.CHECK_PARTNER,
    params: {
        rowIdx,
        row,
        state,
        cleanup: true
    }
});

export const multiCheck = (currentState) => ({
    type: actionTypes.MULTI_CHECK,
    params: {currentState}
});
