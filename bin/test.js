import { paths } from './config/env.js';

import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

import chalk from 'chalk';
import jest from 'jest';
import resolve from 'resolve';

import compatCJSModule from './utils/compatCJSModule.js';

import modules from './config/modules.js';

const { require, dirname } = compatCJSModule(import.meta.url);

let argv = process.argv.slice(2);

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Watch unless on CI or explicitly running all tests
if (
  !process.env.CI &&
  argv.indexOf('--watchAll') === -1 &&
  argv.indexOf('--watchAll=false') === -1
) {
  // https://github.com/facebook/create-react-app/issues/5210
  const hasSourceControl = isInGitRepository() || isInMercurialRepository();
  argv.push(hasSourceControl ? '--watch' : '--watchAll');
}

const createJestConfig = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsMatches = paths.testsSetup.match(/src[/\\]setupTests\.(.+)/);
  const setupTestsFileExtension =
    (setupTestsMatches && setupTestsMatches[1]) || 'js';
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? `<rootDir>/src/setupTests.${setupTestsFileExtension}`
    : undefined;

  const config = {
    roots: ['<rootDir>/src'],

    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],

    setupFiles: [
      isEjecting
        ? 'react-app-polyfill/jsdom'
        : require.resolve('react-app-polyfill/jsdom')
    ],

    setupFilesAfterEnv: setupTestsFile ? [setupTestsFile] : [],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': resolve(
        'config/jest/babelTransform.js'
      ),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': resolve(
        'config/jest/fileTransform.js'
      )
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$'
    ],
    modulePaths: modules.additionalModulePaths || [],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
      ...(modules.jestAliases || {})
    },
    moduleFileExtensions: [...paths.moduleFileExtensions, 'node'].filter(
      (ext) => !ext.includes('mjs')
    ),
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ],
    resetMocks: true
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'clearMocks',
    'collectCoverageFrom',
    'coveragePathIgnorePatterns',
    'coverageReporters',
    'coverageThreshold',
    'displayName',
    'extraGlobals',
    'globalSetup',
    'globalTeardown',
    'moduleNameMapper',
    'resetMocks',
    'resetModules',
    'restoreMocks',
    'snapshotSerializers',
    'testMatch',
    'transform',
    'transformIgnorePatterns',
    'watchPathIgnorePatterns'
  ];
  if (overrides) {
    supportedKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        if (Array.isArray(config[key]) || typeof config[key] !== 'object') {
          // for arrays or primitive types, directly override the config key
          config[key] = overrides[key];
        } else {
          // for object types, extend gracefully
          config[key] = Object.assign({}, config[key], overrides[key]);
        }

        delete overrides[key];
      }
    });
    const unsupportedKeys = Object.keys(overrides);
    if (unsupportedKeys.length) {
      const isOverridingSetupFile =
        unsupportedKeys.indexOf('setupFilesAfterEnv') > -1;

      if (isOverridingSetupFile) {
        console.error(
          chalk.red(
            'We detected ' +
              chalk.bold('setupFilesAfterEnv') +
              ' in your package.json.\n\n' +
              'Remove it from Jest configuration, and put the initialization code in ' +
              chalk.bold('src/setupTests.js') +
              '.\nThis file will be loaded automatically.\n'
          )
        );
      } else {
        console.error(
          chalk.red(
            '\nOut of the box, Create React App only supports overriding ' +
              'these Jest options:\n\n' +
              supportedKeys
                .map((key) => chalk.bold('  \u2022 ' + key))
                .join('\n') +
              '.\n\n' +
              'These options in your package.json Jest configuration ' +
              'are not currently supported by Create React App:\n\n' +
              unsupportedKeys
                .map((key) => chalk.bold('  \u2022 ' + key))
                .join('\n') +
              '\n\nIf you wish to override other Jest options, you need to ' +
              'eject from the default setup. You can do so by running ' +
              chalk.bold('npm run eject') +
              ' but remember that this is a one-way operation. ' +
              'You may also file an issue with Create React App to discuss ' +
              'supporting more options out of the box.\n'
          )
        );
      }

      process.exit(1);
    }
  }
  return config;
};

argv.push(
  '--config',
  JSON.stringify(
    createJestConfig(
      (relativePath) => path.resolve(dirname, relativePath),
      path.resolve(paths.appSrc, '..'),
      false
    )
  )
);

// This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// We're trying to resolve the environment ourselves because Jest does it incorrectly.
// TODO: remove this as soon as it's fixed in Jest.
function resolveJestDefaultEnvironment(name) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: dirname
    })
  );
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir
    })
  );
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir
    })
  );
  return resolve.sync(name, {
    basedir: jestConfigDir
  });
}
let cleanArgv = [];
let env = 'jsdom';
let next;
do {
  next = argv.shift();
  if (next === '--env') {
    env = argv.shift();
  } else if (next.indexOf('--env=') === 0) {
    env = next.substring('--env='.length);
  } else {
    cleanArgv.push(next);
  }
} while (argv.length > 0);
argv = cleanArgv;
let resolvedEnv;
try {
  resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`);
} catch (e) {
  // ignore
}
if (!resolvedEnv) {
  try {
    resolvedEnv = resolveJestDefaultEnvironment(env);
  } catch (e) {
    // ignore
  }
}
const testEnvironment = resolvedEnv || env;
argv.push('--env', testEnvironment);

jest.run(argv);
