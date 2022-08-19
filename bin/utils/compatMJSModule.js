import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export default function compatMJSModule(meteUrl) {
  if (!meteUrl) return null;
  const filename = fileURLToPath(meteUrl);
  const dirname = path.dirname(filename);
  const require = createRequire(meteUrl);
  return { filename, dirname, require };
}
