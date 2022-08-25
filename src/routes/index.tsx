import lazyComp from './lazyComp';

const routes: RouteList = [
  {
    path: '/sandwiches',
    component: lazyComp(() => import('../pages/Sandwiches'))
  },
  {
    path: '/tacos',
    component: lazyComp(() => import('../pages/Tacos')),
    routes: [
      {
        path: '/tacos/bus',
        component: lazyComp(() => import('../pages/Bus'))
      },
      {
        path: '/tacos/cart',
        component: lazyComp(() => import('../pages/Cart'))
      }
    ]
  }
];
export default routes;
