'use strict';
const assert = require('assert');
const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');

describe('Version test of SPO-Returns UI', function() {
  let driver;

  let baseUrl;

  before(async function() {
    baseUrl = process.env.RETURNS_UI_URL;
    if (!baseUrl) {
      baseUrl = 'http://localhost:3000';
    }

    driver = await driverUtil.buildChromeDriver();
  });

  it('checks the version exists and matches expected pattern', async function() {
    let expectedVersion = process.env.UI_VERSION;
    let exactVersion = !!expectedVersion;

    await driver.get(`${baseUrl}/version`);
    const versionInfoElem = await driver.findElement(By.xpath('//*[@id="root"]/div[1]'));
    const versionInfoText = await versionInfoElem.getAttribute('innerHTML');
    console.log(versionInfoText);
    if (exactVersion) {
      assert.strictEqual(versionInfoText, expectedVersion);
    } else {
      assert.strictEqual(true, /^(feature\/.*|bugfix\/.*|release|master|main):.*/.test(versionInfoText));
    }
  });

  after(function() { driver && driver.quit() });
});
