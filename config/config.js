const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;



const loadConfig = (group, name) => {
  const defaultName = path.resolve(`${__dirname}/${group}.default`);
  let pathName = name ? path.resolve(`${__dirname}/${group}.${name}`) : defaultName;
  if (!fs.existsSync(pathName + '.js')) {
    console.log(`${pathName} does not exists, loading defaults`);
    pathName = defaultName;
  }
  return require(pathName);
};

const defaultResolution = { width: 1920, height: 1080 };
const parseResolution = (input = defaultResolution) => {
  if (typeof input === 'object') {
    if (input.width && input.height && !isNaN(parseInt(input.width)) && !isNaN(parseInt(input.height))) {
      return { width: parseInt(input.width), height: parseInt(input.height) };
    }
  } else {
    const wh = input.wplit('x');
    if (wh.length == 2 && !isNaN(parseInt(wh[0])) && !isNaN(parseInt(wh[1]))) {
      return { width: parseInt(wh[0]), height: parseInt(wh[1]) };
    }
  }
  console.log(`Invalid resolution: ${input}, must be in format like '1920x1080'`);
  return defaultResolution
};

const config = {
  env : process.env.NODE_ENV || 'development',
  // url, credentials, is mobile
};

config.resolution = parseResolution(argv.resolution);
config.webdriverio = loadConfig('webdriverio', argv.target);

// http://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
let desiredCapabilities =  loadConfig('browser', argv.browser);
desiredCapabilities.version = argv.version ? argv.version :
  desiredCapabilities.version ? desirecCapabilities.version : '';
// WINDOWS, XP, VISTA, MAC, LINUX, ANDROID
if (argv.platform) {
  const validPlatforms = ['windows', 'xp', 'vista', 'mac', 'linux', 'android'];
  if (validPlatforms.indexOf(argv.platform.toLowerCase() !== -1)) {
    console.log(`Platform '${argv.platform}' is invalid.  Values can be: ${validPlatforms}`);
  } else {
    desiredCapabilities.platform = argv.platform.toUpperCase();
  }
}
config.webdriverio.desiredCapabilities = desiredCapabilities;

// check for environment overrides
const environments = require('./environments.config');
const overrides = environments[config.env];
if (overrides) {
  console.log('Found environmental overrides, merging', overrides);
  Object.assign(config, overrides(config))
}

console.log('Config loaded: \n', config);

module.exports = config;

