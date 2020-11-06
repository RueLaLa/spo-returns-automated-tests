'use strict';
const assert = require('assert');
const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const { uiBaseUrl } = require('../../utils/base-urls');

describe('Version test of SPO-Returns UI', function() {
  let driver;

  before(async function() {
    driver = await driverUtil.buildChromeDriver({});
  });

  it('checks the version exists and matches expected pattern', async function() {
    let expectedVersion = process.env.UI_VERSION;
    let exactVersion = !!expectedVersion;

    await driver.get(`${uiBaseUrl}/version`);
    const versionInfoElem = await driver.findElement(By.xpath('//*[@id="root"]/div[1]'));
    const versionInfoText = await versionInfoElem.getAttribute('innerHTML');

    if (exactVersion) {
      assert.strictEqual(versionInfoText, expectedVersion);
    } else {
      assert.strictEqual(true, /^(feature\/.*|bugfix\/.*|release|master|main):.*/.test(versionInfoText));
    }
  });
});
