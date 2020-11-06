'use strict';

const assert = require('assert');
const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const selectUtils = require('../../utils/select-utils');
const { uiBaseUrl } = require('../../utils/base-urls');

describe('Ensure items that are out of return window cannot be returned', function() {
  let EXPIRED_ORDER_ID;
  let driver;
  before(async function() {
    // build in an implicit 3 second wait so we don't have to wait for page to finish in our tests
    driver = await driverUtil.buildChromeDriver({ implicit: 3000 });
    EXPIRED_ORDER_ID = process.env.EXPIRED_ORDER_ID;
  });

  after(async function() {
    driver && driver.close();
  });

  it('Replaces quantity and reason selectors with messaging', async function() {
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
    assert.ok(messageText.indexOf('return time frame has expired') >= 0);

    try {
      await driver.findElement(By.css('.return-data-item > select'));
    } catch (err) {
      assert.strictEqual(err.name, 'NoSuchElementError');
    }
  });

  it('Includes the messages, but still allows CSR to select a quantity', async function() {
    const url = `${uiBaseUrl}/?orderId=${EXPIRED_ORDER_ID}&CSRMA=1`;
    await driver.get(url);

    const csrWarningElem = await driver.findElement(By.css('.csr-message > p'));
    const warningText = await csrWarningElem.getAttribute('innerHTML');
    assert.ok(warningText.indexOf('item is not returnable by the user') >= 0);

    const qtySelectElem = await driver.findElement(By.css('.return-data-item > select'));
    const selectEnabled = await qtySelectElem.isEnabled();
    assert.ok(selectEnabled);

    await selectUtils.selectByValue(qtySelectElem, '1');
    await selectUtils.assertValueIsSelected(qtySelectElem, '1');
  });
});
