import webpack from 'webpack';
import { merge } from 'webpack-merge';
import WebpackDevServer from 'webpack-dev-server';
import nodemon from 'nodemon';

import getEnv from './config/env.js';
import configFactory from './config/webpack.config.js';
import devServerConfig from './config/devServerConfig.js';
import { statsOptions } from './utils/printWebpackStats.js';

// ready dev command env
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const { paths, clientEnv } = getEnv();
const devSettings = {
  paths,
  clientEnv,
  webpackEnv: 'development'
};
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3000';
const inspectPort = process.env.INSPECT_PORT || port - 2;

process.env.SERVER_HOST = host;
process.env.SERVER_PORT = port - 1;

const compiler = webpack(
  merge(configFactory(devSettings), { stats: statsOptions })
);
const devServer = new WebpackDevServer(
  devServerConfig({ paths, host, port, proxyPort }),
  compiler
);

nodemon(
  `-e js,json,html --watch server --ignore node_modules/**node_modules --inspect=${inspectPort} ./server/index.js`
);

devServer.start();

nodemon
  .on('start', function () {
    console.log('App has started');
  })
  .on('quit', function () {
    console.log('App has quit');
    process.exit();
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files);
  });
