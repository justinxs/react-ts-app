import webpack from 'webpack';
import chalk from 'chalk';
import fsExtra from 'fs-extra';
import nodemon from 'nodemon';

import getEnv from './config/env.js';

import printWebpackStats from './utils/printWebpackStats.js';
import statsErrorOrWarning from './utils/statsErrorOrWarning.js';
import configFactory from './config/webpack.config.js';

// ready start command env
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const { paths, clientEnv } = getEnv();
const startSettings = {
  paths,
  clientEnv,
  webpackEnv: 'development'
};
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '3000';
const inspectPort = process.env.INSPECT_PORT || port - 2;

process.env.SERVER_HOST = host || '0.0.0.0';
process.env.SERVER_PORT = port;

let serverStart;

// 清空构建文件夹
fsExtra.emptyDirSync(paths.appBuild);

const compiler = webpack(configFactory(startSettings));

compiler.watch(
  {
    aggregateTimeout: 300,
    poll: undefined
  },
  (err, stats) => {
    if (!serverStart) {
      nodemon(
        `-e js,json,html --watch server --ignore node_modules/**node_modules --inspect=${inspectPort} ./server/index.js`
      );
      serverStart = true;
    }
    if (err) {
      console.error(chalk.red(err.stack || err));
      if (err.details) {
        console.log(chalk.red(err.details));
      }
    } else {
      printWebpackStats(stats);
    }

    statsErrorOrWarning(stats);
  }
);

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
