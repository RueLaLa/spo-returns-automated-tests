'use strict';

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromium = require('chromium');
require('chromedriver');

module.exports.buildChromeDriver = async () => {
  const options = new chrome.Options();
  options.setChromeBinaryPath(chromium.path);
  options.addArguments([ '--headless', '--disable-gpu', '--window-size=1280,960' ]);

  return new Promise(resolve => {
    new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build()
      .then(driver => resolve(driver));
  });
}
