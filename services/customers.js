'use strict';

const axios = require('axios');
const shopifyUtils = require('../utils/shopify-utils');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports.thoroughDeleteCustomer = async (customerId, maxRetries=5) => {
  let deleted = false;
  let attempt = 0;
  while (!deleted && attempt < maxRetries) {
    if (attempt) {
      await sleep(attempt * 1000);
    }
    deleted = await this.deleteCustomer(customerId);
    attempt++;
  }
  if (!deleted) {
    console.error(`Unable to delete user: ${customerId}`);
  }
  return Promise.resolve(deleted);
}

module.exports.deleteCustomer = async (customerId) => {
  const config = {
    method: 'delete',
    url: `${shopifyUtils.getShopifyUrl()}/admin/api/2020-10/customers/${customerId}.json`,
    headers: shopifyUtils.getAuthHeader()
  };

  return new Promise((resolve) => {
    axios.request(config)
      .then(() =>{
        console.info('Successfully deleted customer');
        resolve(true);
      })
      .catch(err => {
        let message;
        if (err.response) {
          message = `${err.response.status}: ${JSON.stringify(err.response.data)}`;
        } else {
          message = err.message;
        }
        console.info(`error: ${message}`);
        resolve(false);
      });
  });
}
