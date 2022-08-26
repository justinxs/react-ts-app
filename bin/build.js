import webpack from 'webpack';
import chalk from 'chalk';
import fsExtra from 'fs-extra';

import getEnv from './config/env.js';

import printWebpackStats from './utils/printWebpackStats.js';
import statsErrorOrWarning from './utils/statsErrorOrWarning.js';
import configFactory from './config/webpack.config.js';

// ready build command env
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const { paths, clientEnv } = getEnv();
const buildSettings = {
  paths,
  clientEnv,
  webpackEnv: 'production'
};

// 清空构建文件夹
fsExtra.emptyDirSync(paths.appBuild);

const compiler = webpack(configFactory(buildSettings));

compiler.run((err, stats) => {
  if (err) {
    console.error(chalk.red(err.stack || err));
    if (err.details) {
      console.log(chalk.red(err.details));
    }
  } else {
    printWebpackStats(stats, { colors: process.env.PRINT_COLORS === 'true' });
  }

  statsErrorOrWarning(stats);
});
