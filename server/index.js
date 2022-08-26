import { readFile } from 'node:fs/promises';
import Fastify from 'fastify';
import { getLocalIP } from './utils/index.js';
import plugins from './plugins/index.js';
import getLogger from './utils/logger.js';

const host = process.env.SERVER_HOST || '0.0.0.0';
const port = process.env.SERVER_PORT || '3000';
const fastify = Fastify({
  logger: getLogger()
});

plugins(fastify);

fastify.get('*', async (request, reply) => {
  const template = await readFile(
    new URL('../dist/index.html', import.meta.url),
    {
      encoding: 'utf-8'
    }
  );
  reply.type('text/html').code(200);
  return template;
});

fastify.listen({ port, host }, (err, address) => {
  if (err) throw err;
  fastify.log.info('listening http://localhost:' + port);
  fastify.log.info(`listening http://${getLocalIP()}:` + port);
});
