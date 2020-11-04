'use strict';

const axios = require('axios');
const shopifyUtils = require('../utils/shopify-utils');

let cachedProducts = [];

async function queryProducts(vendor) {
  const config = {
    method: 'get',
    headers: shopifyUtils.getAuthHeader(),
    url: `${shopifyUtils.getShopifyUrl()}/admin/api/2020-10/products.json?vendor=${vendor}`,
  };

  return new Promise((resolve) => {
    axios.request(config)
      .then((response) => {
        resolve(response.data.products.map(product => {
          const translated = {
            id: product.id,
            title: product.title,
          };
          return product.variants.map(variant => {
            let v = undefined;
            if (variant.inventory_quantity > 0) {
              v = {
                ...variant,
                variant_id: variant.id,
                variant_title: variant.title,
                ...translated,
              }
            }
            return v;
          }).filter(v => !!v);
        }).flat());
      });
  });
}

module.exports.getProduct = async (vendor='2000') => {
  if (cachedProducts[vendor] && cachedProducts[vendor].length > 0) {
    return Promise.resolve(cachedProducts[vendor].shift());
  }

  return new Promise((resolve, reject) => {
    queryProducts(vendor)
      .then(foundProducts => {
        if (foundProducts.length > 0) {
          const prod = foundProducts.shift();
          cachedProducts[vendor] = foundProducts;
          resolve(prod);
        } else {
          reject(`Unable to find product for vendor ${vendor}`);
        }
      });
  });
}
