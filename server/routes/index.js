import Router from 'koa-router';
import pageRoutes from './page.route.js';
import publicRoutes from './public.route.js';
import PageController from '../controller/page.controller.js';
import PublicController from '../controller/public.controller.js';

const router = new Router();

const routerMap = {
  controllers: {},
  modules: {
    page: {
      routes: pageRoutes,
      Controller: PageController
    },
    public: {
      routes: publicRoutes,
      Controller: PublicController
    }
  },
  getCtr(namespace) {
    if (this === routerMap) {
      if (this.controllers[namespace]) {
        return this.controllers[namespace];
      } else if (this.modules[namespace]) {
        const controller = new this.modules[namespace].Controller();
        return (this.controllers[namespace] = controller);
      }
    }
  }
};

Object.keys(routerMap.modules).forEach((namespace) => {
  const routes = routerMap.modules[namespace].routes;
  const controller = routerMap.getCtr(namespace);
  routes.forEach(({ method, path, action }) => {
    router[method](path, controller[action].bind(controller));
  });
});

// 404页面
const pageController = routerMap.getCtr('page');
router.get(/^(?!\/api).*/, async (ctx, next) => {
  if (/\./g.test(ctx.path)) {
    return next();
  }
  return pageController.page(ctx, next);
});

export default router;
