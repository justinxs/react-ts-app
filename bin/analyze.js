import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import configFactory from './config/webpack.config.js';

const compiler = webpack(
  merge(configFactory('production'), {
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
