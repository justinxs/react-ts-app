import compatMJSModule from './compatMJSModule.js';

const { require } = compatMJSModule(import.meta.url);

export default function getCacheIdentifier(environment, packages) {
  let cacheIdentifier = environment == null ? '' : environment.toString();
  for (const packageName of packages) {
    cacheIdentifier += `:${packageName}@`;
    try {
      cacheIdentifier += require(`${packageName}/package.json`).version;
    } catch (_) {
      // ignored
    }
  }
  return cacheIdentifier;
}
