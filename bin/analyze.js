import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import getEnv from './config/env.js';
import configFactory from './config/webpack.config.js';

// ready analyze command env
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const { paths, clientEnv } = getEnv();
const analyzeSettings = {
  paths,
  clientEnv,
  webpackEnv: 'production'
};

const compiler = webpack(
  merge(configFactory(analyzeSettings), {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: process.env.ANALYZE_PORT || '3009'
      })
    ]
  })
);
compiler.run();
