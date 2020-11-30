'use strict';

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const shopifyUtils = require('../utils/shopify-utils');

async function createOrderBeforeMetadata(requestConfig) {
  return new Promise((resolve, reject) => {
    axios.request(requestConfig)
      .then(response => resolve(response.data.order));
  })
}

module.exports.createOrder = async (config) => {
  const uuid = uuidv4();
  const customerEmail = !!config.email ? config.email : `test-${uuid}@test.com`;
  const customer = !!config.customer ? config.customer : {
    first_name: `Test - ${uuid}`,
    last_name: 'Test',
    email: customerEmail,
  };
  const billingAddress = !!config.billingAddress ? config.billingAddress : {
    ...customer,
    address1: '123 Test',
    city: 'Yorkville',
    province_code: 'IL',
    zip: '60560',
    country_code: 'US',
    phone: '(217)555-0122',
  };

  const uniqueStatuses = new Set(config.lines.map(line => line.fulfillment_status));
  let fulfillmentStatus;
  if (uniqueStatuses.size === 1 && !uniqueStatuses.has('null')) {
    fulfillmentStatus = [...uniqueStatuses][0];
  } else if (uniqueStatuses.size > 1) {
    fulfillmentStatus = 'partial';
  } else {
    fulfillmentStatus = null;
  }

  const jsonBody = {
    order: {
      send_receipt: false,
      send_fulfillment_receipt: false,
      billing_address: billingAddress,
      shipping_address: billingAddress,
      customer: customer,
      email: customerEmail,
      line_items: config.lines,
      financial_status: 'paid',
      fulfillment_status: fulfillmentStatus,
    }
  };

  const shopifyUrl = shopifyUtils.getShopifyUrl();
  const headers = {
    ...shopifyUtils.getAuthHeader(),
    'Content-Type': 'application/json',
  };
  const postRequestConfig = {
    headers: headers,
    method: 'post',
    url: `${shopifyUrl}/admin/api/2020-10/orders.json`,
    data: JSON.stringify(jsonBody),
  };

  const order = await createOrderBeforeMetadata(postRequestConfig);
  const metadataChunks = order.line_items.map(line => `{lineItemId:${line.id},shopId:${line.vendor}}`);

  const putData = {
    order: {
      id: order.id,
      metafields: [
        {
          key: 'offers',
          namespace: 'mirakl',
          value_type: 'STRING',
          value: metadataChunks.join('|'),
        }
      ]
    }
  }
  const putRequestConfig = {
    headers: headers,
    method: 'put',
    url: `${shopifyUrl}/admin/api/2020-10/orders/${order.id}.json`,
    data: JSON.stringify(putData),
  }
  return new Promise((resolve, reject) => {
    axios.request(putRequestConfig)
      .then(response => resolve(response.data.order));
  });
}

module.exports.deleteOrder = async (orderId) => {
  const config = {
    method: 'delete',
    url: `${shopifyUtils.getShopifyUrl()}/admin/api/2020-10/orders/${orderId}.json`,
    headers: shopifyUtils.getAuthHeader()
  };

  return new Promise(resolve => {
    axios.request(config)
      .then(() => resolve(true));
  });
}
