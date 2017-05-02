import React, {PropTypes} from 'react';
import { Route, IndexRoute } from 'react-router';
import {Main} from './pages';
import PaymentPage from './pages/Payment/index';
import {getRoute} from 'ut-front/react/routerHelper';
import registerRoutes from './registerRoutes';
export const mainRoute = registerRoutes();

const getLocalProvider = (config) => {
    return React.createClass({
        propTypes: {
            children: PropTypes.object
        },
        childContextTypes: {
            config: PropTypes.object
        },
        getChildContext() {
            return {
                config: config
            };
        },
        render() {
            return this.props.children;
        }
    });
};
export const UtBulkRoutes = (config) => {
    return (
        <Route component={getLocalProvider(config)}>
                <Route path={getRoute('ut-transfer:bulkBatch')}>
                    <IndexRoute component={Main} />
                </Route>
                <Route path={getRoute('ut-transfer:bulkPayment')} component={PaymentPage} />
        </Route>
    );
};
