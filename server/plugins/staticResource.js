import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';

export default function staticResource(fastify) {
  fastify.register(fastifyStatic, {
    root: fileURLToPath(new URL('../../dist', import.meta.url)),
    prefix: '/',
    wildcard: false,
    cacheControl: true,
    etag: true,
    lastModified: true,
    maxAge: 0
  });
}
