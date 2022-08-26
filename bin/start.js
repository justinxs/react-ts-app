import webpack from 'webpack';
import chalk from 'chalk';
import fsExtra from 'fs-extra';

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

// 清空构建文件夹
fsExtra.emptyDirSync(paths.appBuild);

const compiler = webpack(configFactory(startSettings));

compiler.watch(
  {
    aggregateTimeout: 300,
    poll: undefined
  },
  (err, stats) => {
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
