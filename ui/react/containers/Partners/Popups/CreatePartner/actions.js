import * as actionTypes from './actionTypes';

export function openCreatePartnerPopup() {
    return {
        type: actionTypes.OPEN_CREATE_PARTNER_POPUP
    };
}

export function closeCreatePartnerPopup() {
    return {
        type: actionTypes.CLOSE_CREATE_PARTNER_POPUP
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

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});

export function createPartner(partnerData) {
    return {
        type: actionTypes.CREATE_PARTNER,
        method: 'transfer.partner.add',
        params: {
            partner: partnerData
        }
    };
};
