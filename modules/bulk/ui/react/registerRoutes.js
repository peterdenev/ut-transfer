import {registerRoute} from 'ut-front/react/routerHelper';

export default () => {
    let mainRoute = 'ut-transfer:bulkBatch';
    let recordsRoute = 'ut-transfer:bulkPayment';
    registerRoute(mainRoute).path('bulk/batch');
    registerRoute(recordsRoute).path('bulk/batch/:batchId');
    return mainRoute;
};
