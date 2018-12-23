import React from 'react';
import reducer from './reducers';
import TransferRoutes from './routes';

export function ui() {
    return {
        reducer: () => reducer,
        route: async() => <TransferRoutes key='utTransfer' />
    };
};
