import compatCJSModule from '../utils/compatCJSModule.js';

const { require } = compatCJSModule(import.meta.url);

export default function jsLoaders({ paths, process_env }) {
  const hasJsxRuntime = (() => {
    if (process_env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
      return false;
    }

    try {
      require.resolve('react/jsx-runtime');
      return true;
    } catch (e) {
      return false;
    }
  })();

  return [
    // Process application JS with Babel.
    // The preset includes JSX, Flow, TypeScript, and some ESnext features.
    {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: paths.appSrc,
      loader: require.resolve('babel-loader'),
      options: {
        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
        presets: [
          [
            require.resolve('babel-preset-react-app'),
            {
              runtime: hasJsxRuntime ? 'automatic' : 'classic'
            }
          ]
        ]
      }
    },
    // Process any JS outside of the app with Babel.
    // Unlike the application JS, we only compile the standard ES features.
    {
      test: /\.(js|mjs)$/,
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [
          [
            require.resolve('babel-preset-react-app/dependencies'),
            { helpers: true }
          ]
        ]
      }
    }
  ];
}
