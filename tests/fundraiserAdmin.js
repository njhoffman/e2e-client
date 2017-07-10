const webdriverio = require('webdriverio');
const config = require('../config');
const initUtils = require('../utils');

// getText, getTitle, getTagName, getAttribute
const meta = {
  name: 'fundraiserAdmin',
  desc: 'Fundraiser Admin Walkthrough'
};

config.webdriverio.desiredCapabilities.name = meta.desc;
config.webdriverio.desiredCapabilities.tags = ['super admin'];

const client = webdriverio.remote(config.webdriverio);
const { initScreenshotDirectory, saveScreenshot } = initUtils(meta, client);

console.log("\nTrying to do connect\n");
// const userId = 1181; // foradam
// const userId = 2556; // Bill
const userId = 487; // 100womenHawkeye

client
  .init()
  .then(() => initScreenshotDirectory())
  .setViewportSize(config.resolution)
  .url(config.siteUrl)
  .waitForVisible('a[title="Login"]', 7000)
  .click('a[title="Login"]')
  .waitForVisible('#signin-email', 7000)
  .setValue('#signin-email', 'nickh')
  .setValue('#signin-password', 'cgw3bstrat3gy')
  .click('button.sign-in')
  .waitForVisible('#wpadminbar', 15000)
  .click('a.menu-icon-users')
  .waitForVisible('#user-search-input', 7000)
  .setValue('#user-search-input', userId)
  .click('#search-submit')
  .then(() => saveScreenshot('Submitting search for user ' + userId))
  .waitForVisible('tr#user-' + userId, 9000)
  .then(() => saveScreenshot('Search finished'))
  .moveToObject('tr#user-' + userId)
  .click('tr#user-' + userId + ' .switch_to_user a')
  .waitForVisible('.fund-admin', 7000)
  .then(() => saveScreenshot('Dashboard'))
  .click('#menu-promotion a')
  .waitForVisible('.fundraiser-promotion', 7000)
  .then(() => saveScreenshot('Promotion'))
  .click('.checklist-trigger')
  .waitForVisible('.checklist li:first-child a', 7000)
  .click('.checklist li:first-child a')
  .waitForVisible('.fundraiser-profile-editor', 7000)
  .then(() => saveScreenshot('Profile Editor'))
  .click('#menu-supporters a')
  .waitForVisible('.fundraiser_supporters', 7000)
  .then(() => saveScreenshot('Supporters'))
  .waitForVisible('#menu-post-update a', 7000)
  .then(() => saveScreenshot('Supporters 2'))
  .click('#menu-post-update a')
  .waitForVisible('.page-pane.edit', 7000)
  .then(() => saveScreenshot('Posts'))
  .then(() => {
    console.log('Done');
    return;
  })
  // .end()

