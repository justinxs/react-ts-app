import { Spin } from 'antd';
import lazyComp from './lazyComp';
import Cart from '@/pages/Cart';

const Loading: React.FC = () => <Spin size='large' />;

const routes: RouteList = [
  {
    path: '/sandwiches',
    component: lazyComp(() => import('../pages/Sandwiches'))
  },
  {
    path: '/tacos',
    component: lazyComp(() => import('../pages/Tacos'), {
      fallback: <Loading />
    }),
    routes: [
      {
        path: '/tacos/bus',
        component: lazyComp(() => import('../pages/Bus'), {
          fallback: <Loading />
        })
      },
      {
        path: '/tacos/cart',
        component: Cart
      }
    ]
  }
];
export default routes;
