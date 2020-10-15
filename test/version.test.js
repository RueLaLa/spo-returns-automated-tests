'use strict';
const assert = require('assert');
const { Key, By, until } = require('selenium-webdriver');

const driverUtil = require('../utils/driver');

describe('basic tests of SPO-Returns app', function() {
  let driver;

  let baseUrl;

  before(async function() {
    baseUrl = process.env.BASE_RETURNS_URL;
    if (!baseUrl) {
      baseUrl = 'http://localhost:3000';
    }

    driver = await driverUtil.buildChromeDriver();
  });

  it('checks the version exists and matches expected pattern', async function() {
    await driver.get(`${baseUrl}/version`);
    const versionInfoElem = await driver.findElement(By.xpath('//*[@id="root"]/div[1]'));
    const versionInfoText = await versionInfoElem.getAttribute('innerHTML');
    console.log(versionInfoText);
    assert.strictEqual(true, /^(feature\/.*|bugfix\/.*|release|master):.*/.test(versionInfoText));
  });

  after(() => driver && driver.quit());
});
