'use strict';

const { By, until } = require('selenium-webdriver');

const driverUtil = require('../../utils/driver');
const { uiBaseUrl } = require('../../utils/base-urls');

const customerService = require('../../services/customers');
const emailService = require('../../services/email');
const orderService = require('../../services/orders');
const productService = require('../../services/products');
const selectUtil = require('../../utils/select-utils');
const timingUtils = require('../../utils/timing-utils');

describe('Test create a return for 1 item', () => {
  let orderId;
  let orderName;
  let customerId;
  let customerEmail;
  let testUrl;
  let driver;

  beforeAll(async () => {
    driver = await driverUtil.buildChromeDriver({ implicit: 5000 });
    const product = await productService.getProduct('2000');
    customerEmail = await emailService.getEmail();
    const config = {
      email: customerEmail,
      customer: {
        first_name: 'Smoke Test - Simple Order',
        last_name: 'Smoke Test',
        email: customerEmail
      },
      lines: [
        {
          variant_id: product.variant_id,
          product_id: product.id,
          quantity: 1,
          fulfillable_quantity: 1,
          fulfillment_status: 'fulfilled',
          title: product.title,
          variant_title: product.variant_title,
          price: product.price,
          sku: product.sku,
          barcode: product.barcode,
          vendor: '1999',
        }
      ]
    };
    const order = await orderService.createOrder(config);
    orderId = order.id;
    orderName = order.name;
    customerId = order.customer.id;
    testUrl = `${uiBaseUrl}/?orderId=${orderId}`;
  });

  afterAll(async () => {
    driver && driver.close();

    if (orderId) {
      const orderDeleted = await orderService.deleteOrder(orderId);
      if (!orderDeleted) {
        console.error(`Unable to delete order id: ${orderId}`);
      }
    }

    if (customerId) {
      const custDeleted = await customerService.thoroughDeleteCustomer(customerId);
      if (!custDeleted) {
        console.error(`Unable to delete customer id: ${customerId}`);
      }
    }
  });

  it('All aspects of simple return function as expected', async () => {
    await driver.get(testUrl);

    // confirm only "0" & "1" are in options
    const qtySelectElem = await driver.findElement(By.css('.return-data-item > select'));
    const optionElements = await qtySelectElem.findElements(By.css('option'));
    expect(optionElements.length).toEqual(2);
    // choose qty 1
    await selectUtil.selectByValue(qtySelectElem, '1');
    await selectUtil.assertValueIsSelected(qtySelectElem, '1');
    // get reason select
    const reasonSelectElem = await driver.findElement(By.css('.return-reason > select'));
    const reasonSelectEnabled = await reasonSelectElem.isEnabled();
    // confirm it is enabled
    expect(reasonSelectEnabled).toEqual(true);
    // select first return reason
    await selectUtil.selectByValue(reasonSelectElem, '1');
    // click submit
    const submitButton = await driver.findElement(By.css('button'));
    await submitButton.click();

    // longer explicit wait because creating the return takes time
    const returnIdSpan = await driver.wait(until.elementLocated(By.css('.return-id')), 2000000);
    const returnId = await returnIdSpan.getAttribute('innerHTML');
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(returnId)).toEqual(true);

    // confirm email has arrived after short sleep to allow return email to arrive
    await timingUtils.sleep(3000);
    const emails = await emailService.getEmailMessages(customerEmail);
    expect(emails.length).toEqual(2); // order email and return
    let foundReturnEmail = false;
    const subjectRegex = new RegExp(`Return label for order ${orderName}`, 'i');
    emails.forEach(message => {
      if (subjectRegex.test(message.subject)) {
        foundReturnEmail = true;
      }
    });
    expect(foundReturnEmail).toEqual(true);
  });
});
