import * as actionTypes from './actionTypes';

export function setDatailItem(item) {
    return {
        type: actionTypes.SET_DETAIL_ITEM,
        params: {item}
    };
}

export function changeDetailValue(key, value) {
    return {
        type: actionTypes.CHANGE_DETAIL_VALUE,
        params: {key, value}
    };
}

export function removeDetailItem() {
    return {
        type: actionTypes.REMOVE_DETAIL_ITEM
    };
}

export function saveEditItem(object, actorId) {
    return {
        type: actionTypes.SAVE_EDIT_ITEM,
        method: 'bulk.payment.edit',
        params: {
            actorId: actorId,
            payments: JSON.stringify([object])
        }
    };
}
