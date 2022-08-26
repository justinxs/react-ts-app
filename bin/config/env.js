import path from 'node:path';
import fs from 'node:fs';
import dotenvExpand from 'dotenv-expand';
import dotenv from 'dotenv';

import compatCJSModule from '../utils/compatCJSModule.js';
import getPublicUrlOrPath from '../utils/getPublicUrlOrPath.js';

const { require } = compatCJSModule(import.meta.url);
const appDirectory = fs.realpathSync(process.cwd());
const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx'
];
const REACT_APP = /^REACT_APP_/i;
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// 获取环境配置文件，并写入process.env
// 权重 .env.development.local > .env.local > .env.development > .env
const expandEnv = () => {
  const NODE_ENV = process.env.NODE_ENV;
  const envPath = resolveApp('.env');
  const dotenvFiles = [
    `${envPath}.${NODE_ENV}.local`,
    NODE_ENV !== 'test' && `${envPath}.local`,
    `${envPath}.${NODE_ENV}`,
    envPath
  ].filter(Boolean);
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      dotenvExpand.expand(
        dotenv.config({
          path: dotenvFile
        })
      );
    }
  });
};

function getPaths() {
  const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    require(resolveApp('package.json')).homepage,
    process.env.PUBLIC_URL
  );
  const buildPath = process.env.BUILD_PATH || 'dist';

  return {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appBuild: resolveApp(buildPath),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveModule(resolveApp, 'src/index'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveApp('tsconfig.json'),
    appJsConfig: resolveApp('jsconfig.json'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveModule(resolveApp, 'src/setupTests'),
    proxySetup: resolveApp('src/setupProxy.js'),
    appNodeModules: resolveApp('node_modules'),
    appWebpackCache: resolveApp('node_modules/.cache'),
    appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
    swSrc: resolveModule(resolveApp, 'src/service-worker'),
    publicUrlOrPath,
    moduleFileExtensions
  };
}

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PUBLIC_URL: publicUrl,
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        FAST_REFRESH: process.env.FAST_REFRESH !== 'false'
      }
    );
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
  };

  return { raw, stringified };
}

export default function getEnv() {
  // NODE_ENV must be ready
  if (!process.env.NODE_ENV) {
    throw new Error(
      'The NODE_ENV environment variable is required but was not specified.'
    );
  }

  // set process.env first depends on NODE_ENV
  expandEnv();

  // paths settings depends on process.env
  const paths = getPaths();

  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const clientEnv = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

  // return global settings
  return {
    paths,
    clientEnv
  };
}
