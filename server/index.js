import Koa from 'koa';
import router from './routes/index.js';
import plugins from './plugins/index.js';
import middleware from './middleware/index.js';
import { getLocalIP } from './utils/ip.js';

const NODE_ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.SERVER_HOST || '0.0.0.0';
const PORT = process.env.SERVER_PORT || '9000';
const isDev = NODE_ENV === 'development';
const app = new Koa();

async function start() {
  // 允许代理
  app.proxy = true;

  // 插件
  plugins(app);

  // koa中间件
  middleware(app);

  // 路由中间件
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(PORT, HOST);
  console.log(`listening http://localhost:${PORT}`);
  isDev && console.log(`listening http://${getLocalIP()}:${PORT}`);
}

start().catch((err) => console.error('server start error:', err));
