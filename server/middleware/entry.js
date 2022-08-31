export default async (ctx, next) => {
  console.log('start >>>', ctx.method, ctx.url);

  await next();

  console.log('end >>>', ctx.status, ctx.method, ctx.url);
};
