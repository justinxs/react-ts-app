export default async (ctx, next) => {
  await next();
  // api接口 后置响应处理
  // ctx.set('Access-Control-Allow-Origin', '*');
  // ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  // ctx.set('Access-Control-Allow-Headers', '*');
  // ctx.set('Access-Control-Allow-Credentials', true);
};
