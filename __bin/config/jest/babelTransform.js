import babelJest from 'babel-jest';
import compatCJSModule from '../../utils/compatCJSModule.js';

const { require } = compatCJSModule(import.meta.url);

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

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-react-app'),
      {
        runtime: hasJsxRuntime ? 'automatic' : 'classic'
      }
    ]
  ],
  babelrc: false,
  configFile: false
});
