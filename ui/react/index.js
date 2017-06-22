import React from 'react';
import {Route} from 'react-router';
import { getRoute } from 'ut-front/react/routerHelper';
import registerRoutes from './registerRoutes';
import { Partner } from './pages';

export const mainRoute = registerRoutes();

export const UtTransferRoutes = () => {
    return (
        <Route path={getRoute('ut-transfer:home')}>
            <Route path={getRoute('ut-transfer:partners')} component={Partner} />
        </Route>
    );
};
