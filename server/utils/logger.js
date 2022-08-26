import pino from 'pino';
import path from 'node:path';

export default function getLogger() {
  const logger = pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l'
        // destination: path.join(process.cwd(), 'logs/fastify.log'),
        // mkdir: true,
        // append: true,
        // sync: false
      }
    }
  });

  return logger;
}
