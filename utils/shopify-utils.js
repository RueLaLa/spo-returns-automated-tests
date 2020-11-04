'use strict';

let shopifyUrl;
function initUrl() {
  shopifyUrl = process.env.SHOPIFY_SITE_URL;
  if (!shopifyUrl) {
    throw new Error('Shopify URL is not defined');
  }
  if (shopifyUrl.endsWith('/')) {
    shopifyUrl = shopifyUrl.slice(0, -1);
  }
}

module.exports.getShopifyUrl = () => {
  if (!shopifyUrl) {
    initUrl();
  }
  return shopifyUrl;
}

module.exports.getAuthHeader = () => {
  return {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
  }
}
