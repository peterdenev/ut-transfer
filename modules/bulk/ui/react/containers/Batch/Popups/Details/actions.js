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

export function saveEditItem(object) {
    let newObject = {
        batchId: object.batchId,
        name: object.name,
        actorId: object.actorId
    };
    return {
        type: actionTypes.SAVE_EDIT_ITEM,
        method: 'bulk.batch.edit',
        params: newObject
    };
}
