import path from 'node:path';
import compatCJSModule from '../utils/compatCJSModule.js';

const { require } = compatCJSModule(import.meta.url);

export default function jsLoaders({ paths }) {
  const babelEnv = process.env.BABEL_ENV || process.env.NODE_ENV;
  const isBabelEnvDevelopment = babelEnv === 'development';
  const isBabelEnvProduction = babelEnv === 'production';
  const isBabelEnvTest = babelEnv === 'test';
  const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
      return false;
    }
    try {
      require.resolve('react/jsx-runtime');
      return true;
    } catch (e) {
      return false;
    }
  })();

  let useESModules = isBabelEnvDevelopment || isBabelEnvProduction;
  let isTypeScriptEnabled = true;
  let areHelpersEnabled = true;
  let useAbsoluteRuntime = true;
  let absoluteRuntimePath = undefined;
  if (useAbsoluteRuntime) {
    absoluteRuntimePath = path.dirname(
      require.resolve('@babel/runtime/package.json')
    );
  }
  if (!isBabelEnvDevelopment && !isBabelEnvProduction && !isBabelEnvTest) {
    throw new Error(
      'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(babelEnv) +
        '.'
    );
  }

  return [
    // Process application JS with Babel.
    // The preset includes JSX, Flow, TypeScript, and some ESnext features.
    {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: paths.appSrc,
      loader: 'babel-loader',
      options: {
        presets: [
          [
            // Latest stable ECMAScript features
            '@babel/preset-env',
            isBabelEnvTest
              ? {
                  targets: {
                    node: 'current'
                  }
                }
              : {
                  // Allow importing core-js in entrypoint and use browserlist to select polyfills
                  useBuiltIns: 'entry',
                  // Set the corejs version we are using to avoid warnings in console
                  corejs: 3,
                  // Exclude transforms that make all code slower
                  exclude: ['transform-typeof-symbol']
                }
          ],
          [
            '@babel/preset-react',
            {
              // Adds component stack to warning messages
              // Adds __self attribute to JSX which React will use for some warnings
              development: isBabelEnvDevelopment || isBabelEnvTest,
              // Will use the native built-in instead of trying to polyfill
              // behavior for any plugins that require one.
              ...(hasJsxRuntime ? { useBuiltIns: true } : {}),
              runtime: hasJsxRuntime ? 'automatic' : 'classic'
            }
          ],
          isTypeScriptEnabled && ['@babel/preset-typescript']
        ].filter(Boolean),
        plugins: [
          // Turn on legacy decorators for TypeScript files
          isTypeScriptEnabled && ['@babel/plugin-proposal-decorators', false],
          // class { handleClick = () => { } }
          // Enable loose mode to use assignment instead of defineProperty
          // See discussion in https://github.com/facebook/create-react-app/issues/4263
          // Note:
          // 'loose' mode configuration must be the same for
          // * @babel/plugin-proposal-class-properties
          // * @babel/plugin-proposal-private-methods
          // * @babel/plugin-proposal-private-property-in-object
          // (when they are enabled)
          [
            '@babel/plugin-proposal-class-properties',
            {
              loose: true
            }
          ],
          [
            '@babel/plugin-proposal-private-methods',
            {
              loose: true
            }
          ],
          [
            '@babel/plugin-proposal-private-property-in-object',
            {
              loose: true
            }
          ],
          // Adds Numeric Separators
          '@babel/plugin-proposal-numeric-separator',
          // Polyfills the runtime needed for async/await, generators, and friends
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
              helpers: areHelpersEnabled,
              // By default, babel assumes babel/runtime version 7.0.0-beta.0,
              // explicitly resolving to match the provided helper functions.
              // https://github.com/babel/babel/issues/10261
              version: require('@babel/runtime/package.json').version,
              regenerator: true,
              // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
              // We should turn this on once the lowest version of Node LTS
              // supports ES Modules.
              useESModules,
              // Undocumented option that lets us encapsulate our runtime, ensuring
              // the correct version is used
              // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
              absoluteRuntime: absoluteRuntimePath
            }
          ],
          isBabelEnvProduction && [
            // Remove PropTypes from production build
            'babel-plugin-transform-react-remove-prop-types',
            {
              removeImport: true
            }
          ],
          // Optional chaining and nullish coalescing are supported in @babel/preset-env,
          // but not yet supported in webpack due to support missing from acorn.
          // These can be removed once webpack has support.
          // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator'
        ].filter(Boolean),
        overrides: [
          isTypeScriptEnabled && {
            test: /\.tsx?$/,
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]]
          }
        ].filter(Boolean)
      }
    },
    // Process any JS outside of the app with Babel.
    // Unlike the application JS, we only compile the standard ES features.
    {
      test: /\.(js|mjs)$/,
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        configFile: false,
        compact: false,
        // Babel assumes ES Modules, which isn't safe until CommonJS
        // dies. This changes the behavior to assume CommonJS unless
        // an `import` or `export` is present in the file.
        // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
        sourceType: 'unambiguous',
        presets: [
          [
            // Latest stable ECMAScript features
            '@babel/preset-env',
            isBabelEnvTest
              ? {
                  targets: {
                    node: 'current'
                  },
                  // Exclude transforms that make all code slower
                  exclude: ['transform-typeof-symbol']
                }
              : {
                  // Allow importing core-js in entrypoint and use browserlist to select polyfills
                  useBuiltIns: 'entry',
                  // Set the corejs version we are using to avoid warnings in console
                  // This will need to change once we upgrade to corejs@3
                  corejs: 3,
                  // Exclude transforms that make all code slower
                  exclude: ['transform-typeof-symbol']
                }
          ]
        ].filter(Boolean),
        plugins: [
          // Polyfills the runtime needed for async/await, generators, and friends
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
              helpers: areHelpersEnabled,
              // By default, babel assumes babel/runtime version 7.0.0-beta.0,
              // explicitly resolving to match the provided helper functions.
              // https://github.com/babel/babel/issues/10261
              version: require('@babel/runtime/package.json').version,
              regenerator: true,
              // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
              // We should turn this on once the lowest version of Node LTS
              // supports ES Modules.
              useESModules: isBabelEnvDevelopment || isBabelEnvProduction,
              // Undocumented option that lets us encapsulate our runtime, ensuring
              // the correct version is used
              // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
              absoluteRuntime: absoluteRuntimePath
            }
          ]
        ].filter(Boolean)
      }
    }
  ].filter(Boolean);
}
