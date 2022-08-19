import path from 'node:path';
import fs from 'node:fs';
import chalk from 'chalk';

function checkRequiredFiles(files) {
  var currentFilePath;
  try {
    files.forEach((filePath) => {
      currentFilePath = filePath;
      fs.accessSync(filePath, fs.F_OK);
    });
    return true;
  } catch (err) {
    var dirName = path.dirname(currentFilePath);
    var fileName = path.basename(currentFilePath);
    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
    console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
    return false;
  }
}

export default checkRequiredFiles;
