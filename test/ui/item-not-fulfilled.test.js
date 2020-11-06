'use strict';

const assert = require('assert');
const { By } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const { uiBaseUrl } = require('../../utils/base-urls');

const customerService = require('../../services/customers');
const orderService = require('../../services/orders');
const productService = require('../../services/products');

describe('Test that the UI responds properly when an item is not fulfilled', function () {
  let orderId;
  let customerId;
  let url;
  let driver;
  before(async function() {
    // build in an implicit 3 second wait so we don't have to wait for page to finish in our tests
    driver = await driverUtil.buildChromeDriver({ implicit: 3000 });
    const product = await productService.getProduct('2000');
    const config = {
      lines: [
        {
          variant_id: product.variant_id,
          product_id: product.id,
          quantity: 1,
          fulfillable_quantity: 1,
          fulfillment_status: 'null',
          title: product.title,
          variant_title: product.variant_title,
          price: product.price,
          sku: product.sku,
          barcode: product.barcode,
          vendor: '2000',
        }
      ]
    };
    const order = await orderService.createOrder(config);
    orderId = order.id;
    customerId = order.customer.id;
    url = `${uiBaseUrl}/?orderId=${orderId}`;
  });

  after(async function() {
    driver && driver.close();

    if (orderId) {
      await orderService.deleteOrder(orderId);
    }

    if (customerId) {
      await customerService.thoroughDeleteCustomer(customerId);
    }
  });

  it('will NOT allow quantity changes on unfulfilled items', async function() {
    await confirmMessageAndUntouchableSelect(url);
  });

  it('will NOT allow quantity changes on unfulfilled items even with CSR override', async function() {
    const urlWithOverride = `${url}&CSRMA=fake`;
    await confirmMessageAndUntouchableSelect(urlWithOverride);
  });

  async function confirmMessageAndUntouchableSelect(testUrl) {
    await driver.get(testUrl);

    const messageElem = await driver.findElement(By.css('.return-data-message > p'));
    const messageText = await messageElem.getAttribute('innerHTML');
    assert.ok('Not shipped'.toUpperCase() === messageText.toUpperCase());

    let foundError = false;
    try {
      await driver.findElement(By.css('.return-data-item > select'));
    } catch (err) {
      foundError = err;
    }
    assert.ok(foundError);
    assert.strictEqual(foundError.name, 'NoSuchElementError');
  }
});
