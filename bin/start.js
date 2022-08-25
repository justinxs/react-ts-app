import webpack from 'webpack';
import chalk from 'chalk';
import fsExtra from 'fs-extra';

import printWebpackStats from './utils/printWebpackStats.js';
import statsErrorOrWarning from './utils/statsErrorOrWarning.js';
import configFactory, { paths } from './config/webpack.config.js';

// 清空构建文件夹
fsExtra.emptyDirSync(paths.appBuild);

const compiler = webpack(configFactory('development'));

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
