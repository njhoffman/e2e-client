module.exports = {
  browserName: 'chrome',
  chromeOptions: {
    prefs: {
      credentials_enable_service : false,
      profile: {
        'password_manager_enabled' : false
      }
    },
    args: [
      // 'load-extension=' + __dirname + '/test/extensions/adblock'
    ]
  }
};
