import React from 'react';
import {Route} from 'react-router';
import { getRoute } from 'ut-front-react/routerHelper';
import registerRoutes from './registerRoutes';
import { Partner } from './pages';
import reducer from './reducers';

registerRoutes();

export function ui() {
    return {
        reducer: () => reducer,
        route: async() => <Route key='utTransfer' path={getRoute('ut-transfer:home')}>
            <Route path={getRoute('ut-transfer:partners')} component={Partner} />
        </Route>
    };
};
