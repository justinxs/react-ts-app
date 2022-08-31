let reqId = 0;
export default async (ctx, next) => {
  console.log(`enter  ( ${++reqId} )  >>> ${ctx.method} ${ctx.url}`);

  await next();

  console.log(`output ( ${reqId} )  >>> ${ctx.method} ${ctx.status} ${ctx.url}`);
};
