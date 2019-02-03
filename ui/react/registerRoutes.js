import { registerRoute } from 'ut-front-react/routerHelper';

export default () => {
    let mainRoute = 'ut-transfer:home';
    registerRoute(mainRoute).path('/transfer');
    registerRoute('ut-transfer:partners').path('partners').parent(mainRoute);
    return mainRoute;
};
