'use strict';
const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const { uiBaseUrl } = require('../../utils/base-urls');

describe('Version test of SPO-Returns UI', () => {
  let driver;

  beforeAll(async () => {
    driver = await driverUtil.buildChromeDriver({});
  });

  afterAll(async () => {
    driver && driver.close();
  })

  it('checks the version exists and matches expected pattern', async () => {
    let expectedVersion = process.env.UI_VERSION;
    let exactVersion = !!expectedVersion;

    await driver.get(`${uiBaseUrl}/version`);
    const versionInfoElem = await driver.findElement(By.xpath('//*[@id="root"]/div[1]'));
    const versionInfoText = await versionInfoElem.getAttribute('innerHTML');

    let regex;
    if (exactVersion) {
      regex = new RegExp(`^${expectedVersion}$`);
    } else {
      regex = /^(feature\/.*|bugfix\/.*|release|master|main):.*/;
    }

    expect(regex.test(versionInfoText)).toEqual(true);
  });
});
