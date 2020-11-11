'use strict';

const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const selectUtils = require('../../utils/select-utils');
const { uiBaseUrl } = require('../../utils/base-urls');

describe('Ensure items that are out of return window cannot be returned', () => {
  let EXPIRED_ORDER_ID;
  let driver;
  beforeAll(async () => {
    // build in an implicit 5 second wait so we don't have to wait for page to finish in our tests
    driver = await driverUtil.buildChromeDriver({ implicit: 5000 });
    EXPIRED_ORDER_ID = process.env.EXPIRED_ORDER_ID;
  });

  afterAll(async () => {
    driver && driver.close();
  });

  it('Replaces quantity and reason selectors with messaging', async () => {
    const url = `${uiBaseUrl}/?orderId=${EXPIRED_ORDER_ID}`;
    await driver.get(url);

    let messageElem;
    try {
      // try this way first... sometimes space after class can cause hiccups
      messageElem = await driver.findElement(By.css('.return-data-message > p'));
    } catch (e) {
      messageElem = await driver.findElement(By.xpath(`//*[@class="return-data-message "]//p`));
    }
    // const messageElem = await driver.findElement(By.css('.return-data-message > p'));
    const messageText = await messageElem.getAttribute('innerHTML');
    expect(messageText.indexOf('return time frame has expired') >= 0).toEqual(true);

    let foundError = undefined;
    try {
      await driver.findElement(By.css('.return-data-item > select'));
    } catch (err) {
      foundError = err;
    }
    expect(foundError).toBeDefined();
    expect(foundError.name).toEqual('NoSuchElementError');
  });

  it('Includes the messages, but still allows CSR to select a quantity', async () => {
    const url = `${uiBaseUrl}/?orderId=${EXPIRED_ORDER_ID}&CSRMA=1`;
    await driver.get(url);

    const csrWarningElem = await driver.findElement(By.css('.csr-message > p'));
    const warningText = await csrWarningElem.getAttribute('innerHTML');
    expect(warningText.indexOf('item is not returnable by the user') >= 0).toBeTruthy();

    const qtySelectElem = await driver.findElement(By.css('.return-data-item > select'));
    const selectEnabled = await qtySelectElem.isEnabled();
    expect(selectEnabled).toEqual(true);

    await selectUtils.selectByValue(qtySelectElem, '1');
    await selectUtils.assertValueIsSelected(qtySelectElem, '1');
  });
});
