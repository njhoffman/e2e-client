const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

let moduleName, client;

const displayError = (description) => (err) => {
  if (err.message.indexOf('org.openqa.selenium.os.Kernel32') !== -1) {
    console.log("Stupid selenium grid closing error on Windows.");
    return;
  }
  console.error(`\n\n${chalk.bold.bgRed('*** ERROR: ***')}\n`);
  console.log(`${description}: ${err.name}`);
  switch(err.name) {
    default:
      err.message.split('\n').forEach(msg => {
        console.error(`${err.name}: ${msg}`);
      });
      console.error(err.stack);
      break;
  }
  console.error(`\n${chalk.bold.bgRed('*** ERROR ***')}\n\n`);
};

process.on('uncaughtException', displayError('An uncaught exception occured.'));
process.on('unhandledRejection', displayError('An unhandled rejection occured.'));

const pad = (n, width) => {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
};

const saveScreenshot = (testName) => {
  let ssPath = path.resolve('reports/screenshots/',  moduleName);
  const dt = new Date();
  ssPath += '/' +  pad(dt.getHours(), 2) + '.' + pad(dt.getMinutes(), 2)  + '.' +
    pad(dt.getSeconds(), 2) + '.' + pad(dt.getMilliseconds(), 3) + ' - ' + testName + '.png';
  console.log(`\n  ${chalk.cyan('→ Screenshot: ')} ${chalk.italic(ssPath)}\n`);
  return client.saveScreenshot(ssPath);
};

const initScreenshotDirectory = () => {
  let dir = path.resolve('reports/screenshots/', moduleName + '/');
  if (!fs.existsSync(dir)) {
    console.log(`\nMaking directory: ${dir}\n`);
    fs.mkdirSync(dir);
  }
  const files = fs.readdirSync(dir);

  console.log(`\nDeleting ${files.length} files\n`);
  for (const file of files) {
    fs.unlink(path.join(dir, file), err => {
      if (err) throw error;
    });
  }
  return;
}

const initUtils = (meta, _client) => {
  moduleName = meta.name;
  client = _client;
  return {
    saveScreenshot,
    initScreenshotDirectory
  };
}

module.exports = initUtils;
