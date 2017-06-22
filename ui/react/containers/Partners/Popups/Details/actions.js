import * as actionTypes from './actionTypes';

export function fetchPartnerDetails(partnerId) {
    return {
        type: actionTypes.FETCH_PARTNER_DETAILS,
        method: 'transfer.partner.get',
        params: {
            partnerId
        }
    };
}

export function changeField(key, value, data) {
    return {
        type: actionTypes.CHANGE_FIELD,
        key,
        value,
        data
    };
}

export function editPartner(partnerData) {
    return {
        type: actionTypes.EDIT_PARTNER_DETAILS,
        method: 'transfer.partner.edit',
        params: {
            partner: partnerData
        }
    };
}

export function closeDetailsDialog() {
    return {
        type: actionTypes.CLOSE_DETAILS_POPUP
    };
}

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});
