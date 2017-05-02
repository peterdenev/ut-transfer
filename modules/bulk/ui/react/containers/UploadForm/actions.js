import * as actionTypes from './actionTypes';

export const methodRequestState = {
    FINISHED: 'finished',
    REQUESTED: 'requested'
};

export const showPreload = (index) => ({
    type: actionTypes.TOGGLE_PRELOAD,
    methodRequestState: methodRequestState.REQUESTED,
    prefetchWindowText: 'Uploading file to server...'
});

export const hidePreload = (index) => ({
    type: actionTypes.TOGGLE_PRELOAD,
    methodRequestState: methodRequestState.FINISHED
});
