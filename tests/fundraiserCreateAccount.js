const chalk = require('chalk');
const Convert = require('ansi-to-html');
const convert = new Convert();

const webdriverio = require('webdriverio');
const faker = require('faker');

const config = require('../config');
const initUtils = require('../utils');
const logoImage = require('../fixtures/lion.datauri');

const meta =  {
  name: 'fundraiserCreateAccount',
  desc: 'Fundraiser Create Account and Fundraiser'
};

config.webdriverio.desiredCapabilities.name = meta.desc;
config.webdriverio.desiredCapabilities.tags = ['fundraiser'];

const client = webdriverio.remote(config.webdriverio);
const { initScreenshotDirectory, saveScreenshot } = initUtils(meta, client);

const emailName = 'njhoffman1982+' + parseInt(Math.random() * 1000000) + '@gmail.com';
const password = 'cgw3bstrat3gy';
const fundName = faker.random.words() + ' Test Fundraiser';

const saveButton = 'button[name="save_continue"]';

console.log('running ...');
const exec = () => {
  client
    .init()
    .then(() => initScreenshotDirectory())
    .setViewportSize(config.resolution)
    .url(config.targetUrl)
    .waitForVisible('a[title="Start Fund"]', 9000)
    .emit('log', 'Starting Fundraiser Account Creation')
    .then(() => saveScreenshot('Home'))
    .click('a[title="Start Fund"]')
    .waitForVisible('#signup-form', 3000)
    .setValue('#signup-first-name', faker.name.firstName())
    .setValue('#signup-last-name', faker.name.lastName())
    .setValue('#signup-email', emailName)
    .setValue('#signup-confirm-username', emailName)
    .setValue('#signup-password', password)
    .then(() => saveScreenshot('Create Account Dialog'))
    .click('button.create-account')
    .waitForVisible('#startfund-form', 5000)
    .setValue('#startfund-name', fundName)
    .element('.fundraiser-type label:nth-child(' + [1,3,5,7][Math.round(Math.random() * 2)] + ')').click('input')
    .element('.fundraiser-type label:nth-child(' + [9,11,13,15][Math.round(Math.random() * 3)] + ')').click('input')
    .setValue('#startfund-city', faker.address.city())
    .selectByIndex('#startfund-state', 17)
    .then(() => saveScreenshot('Start a Fund Dialog'))
    .click('button.start-fund')
  // fundraiser admin area
    .waitForVisible('#setupfund-form', 5000)
    .then(() => saveScreenshot('Setup Fund Dialog'))
    .click('button.keep-going')
  // step 1
    .then(() => saveScreenshot('Step 1'))
    .click(saveButton)
  // step 2
    .waitForVisible('input[name="fundraiser_goal_amount"]', 5000)
    .setValue('input[name="fundraiser_goal_amount"', Math.round(Math.random() * 100) * 1000)
    .setValue('input[name="fundraiser_start_date"]', '06/02/2017')
    .setValue('input[name="fundraiser_end_date"]', '07/02/2017')
    .then(() => saveScreenshot('Step 2'))
    .click(saveButton)
  // step 3
    .waitForVisible('iframe', 5000)
    .frame('fundraiser_description_ifr')
    .setValue('#tinymce', faker.lorem.paragraphs(2))
    .frameParent()
    .then(() => saveScreenshot('Step 3'))
    .click(saveButton)
  // step 4
    .waitForVisible('button.add-image', 3000)
    .selectorExecute('#logo_image', (sel, dataUri) => {
      $('#logo_file').attr('targetid', '#logo_image');
      return $('#logo_image').attr('src', dataUri).show();
    }, logoImage)
    .waitForVisible('#logo_image', 20000)
    .then(() => saveScreenshot('Step 4'))
    .click(saveButton)
    .then(() => saveScreenshot('Step 4 - Image Upload'))
  // step 5
    .waitForVisible('textarea[name="thank_you_message"]', 5000)
    .then(() => saveScreenshot('Step 5'))
    .setValue('textarea[name="thank_you_message"]', faker.lorem.paragraph())
    .click(saveButton)
  // step 6
    .waitForVisible('input[name="leader_organization"]', 5000)
    .setValue('input[name="leader_address"]', faker.address.streetAddress())
    .setValue('input[name="leader_city"]', faker.address.city())
    .setValue('input[name="leader_state"]', faker.address.state())
    .setValue('input[name="leader_zip"]', faker.address.zipCode())
    .setValue('input[name="leader_phone"]', faker.phone.phoneNumber())
    .click('#same-as-leader')
    .then(() => saveScreenshot('Step 6'))
    .click(saveButton)
  // step 7
    .waitForVisible('input[name="fundraiser_website"]', 5000)
    .then(() => saveScreenshot('Step 7'))
    .click(saveButton)
  // step 8
    .waitForVisible('input[name="custom_apparel"]', 5000)
    .click('input[name="custom_apparel"]')
    .click('input[name="mvp"]')
    .click('input[name="bulk_free_shipping"]')
    .then(() => saveScreenshot('Step 8'))
    .click(saveButton)
  // launch step
    .waitForVisible('button.launch-btn', 5000)
    .click('a.launch-btn')
    .pause(500)
    .switchTab()
    .then(() => saveScreenshot('Preview'))
    .switchTab()
    .click('button.launch-btn')
    .waitForVisible('li.pending', 5000)
    .then(() => saveScreenshot('Launch'))
    .click('button.launch-btn')
    .then(() => saveScreenshot('Home'))
    .waitForVisible('body.home-fhpage', 5000)
    .then(() => {
      console.log(chalk.white.bgGreen('\n\nFinished "Fundraiser Create Account" Test\n\n'));
      return;
    })
    .end()
};

exec();

