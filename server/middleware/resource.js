import { fileURLToPath } from 'node:url';
import staticCache from 'koa-static-cache';
import LRU from 'lru-cache';

// 服务器缓存，最多1000个，最大缓存时间1个钟，过期后服务器重新读取对应文件
const files = new LRU({ max: 1000, ttl: 60 * 60 * 1000 });
const resourceMiddleware = staticCache({
  dir: fileURLToPath(new URL('../../dist', import.meta.url)),
  dynamic: true,
  // Cache-Control: max-age=<seconds>
  // 浏览器缓存(served from [memory|disk] cache)，
  // 过期后验证其有效性即协商缓存（对比文件没修改应返回 304 Not Modified）
  // If-Modified-Since === Last-Modified  If-None-Match === ETag
  maxAge: 0,
  // Content-Encoding: gzip
  gzip: false,
  files: files
});
const LIMIT_STATIC =
  /(vue-ssr-client-manifest\.json$)|(vue-ssr-server-bundle\.json$)/i;
export default async (ctx, next) => {
  if (LIMIT_STATIC.test(ctx.path)) {
    await next();
  } else {
    await resourceMiddleware(ctx, next);
  }
};
