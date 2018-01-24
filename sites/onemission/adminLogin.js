const webdriverio = require('webdriverio');
const config = require('../../config');
const initUtils = require('../../utils');

// getText, getTitle, getTagName, getAttribute
const meta = {
  name: 'adminLogin',
  desc: 'Super-Admin Login'
};

config.webdriverio.desiredCapabilities.name = meta.desc;
config.webdriverio.desiredCapabilities.tags = ['super admin'];

const client = webdriverio.remote(config.webdriverio);
const { initScreenshotDirectory, saveScreenshot } = initUtils(meta, client);

console.log("\nTrying to do connect\n", options);

client
  .init()
  .then(() => initScreenshotDirectory())
  .setViewportSize(config.resolution)
  .url(config.siteUrl)
  .waitForVisible('a[title="Login"]')
  .then(() => saveScreenshot('Home', moduleName, client))
  .click('a[title="Login"]')
  .waitForVisible('#signin-form', 1000)
  .then(() => saveScreenshot('Login Dialog'))
  .setValue('#signin-email', 'nickh')
  .setValue('#signin-password', 'cgw3bstrat3gy')
  .click('button.sign-in')
  .waitForVisible('a[title="Admin"]', 5000)
  .then(() => saveScreenshot('Home After Login'))
  .click('a[title="Admin"]')
  .waitForVisible('#wpadminbar', 5000)
  .then(() => saveScreenshot('Admin Area'))
  .then(() => {
    console.log('Done');
    return;
  })
  .end()

