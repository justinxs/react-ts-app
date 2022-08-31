import { createHash } from 'node:crypto';

export default (env) => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};
