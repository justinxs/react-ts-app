import path from 'node:path';
import fs from 'node:fs';
import chalk from 'chalk';

import compatCJSModule from '../utils/compatCJSModule.js';

const { require } = compatCJSModule(import.meta.url);

/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 * @param {Object} paths
 */
function getAdditionalModulePaths(options = {}, paths) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return '';
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
  // the default behavior.
  if (path.relative(paths.appNodeModules, baseUrlResolved) === '') {
    return null;
  }

  // Allow the user set the `baseUrl` to `appSrc`.
  if (path.relative(paths.appSrc, baseUrlResolved) === '') {
    return [paths.appSrc];
  }

  // If the path is equal to the root directory we ignore it here.
  // We don't want to allow importing from the root directly as source files are
  // not transpiled outside of `src`. We do allow importing them with the
  // absolute path (e.g. `src/Components/Button.js`) but we set that up with
  // an alias.
  if (path.relative(paths.appPath, baseUrlResolved) === '') {
    return null;
  }

  // Otherwise, throw an error.
  throw new Error(
    chalk.red.bold(
      "Your project's `baseUrl` can only be set to `src` or `node_modules`." +
        ' Create React App does not support other values at this time.'
    )
  );
}

/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 * @param {*} paths
 */
function getWebpackAliases(options = {}, paths) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if (path.relative(paths.appPath, baseUrlResolved) === '') {
    return {
      src: paths.appSrc
    };
  }
}

/**
 * Get jest aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 * @param {*} paths
 */
function getJestAliases(options = {}, paths) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if (path.relative(paths.appPath, baseUrlResolved) === '') {
    return {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^src/(.*)$': '<rootDir>/src/$1'
    };
  }
}

function getModules(paths) {
  const hasTsConfig = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  if (hasTsConfig && hasJsConfig) {
    throw new Error(
      'You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file.'
    );
  }

  let config;

  if (hasTsConfig) {
    const ts = require('typescript');
    config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
  } else if (hasJsConfig) {
    config = require(paths.appJsConfig);
  }

  config = config || {};
  const options = config.compilerOptions || {};

  const additionalModulePaths = getAdditionalModulePaths(options, paths);

  return {
    additionalModulePaths: additionalModulePaths,
    webpackAliases: getWebpackAliases(options, paths),
    jestAliases: getJestAliases(options, paths),
    hasTsConfig
  };
}

export default getModules;
