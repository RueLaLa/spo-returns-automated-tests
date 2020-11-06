'use strict';

let apiBaseUrl = process.env.RETURNS_API_URL;
if (!apiBaseUrl) {
  apiBaseUrl = 'http://localhost:7071/api';
}

let uiBaseUrl = process.env.RETURNS_UI_URL;
if (!uiBaseUrl) {
  uiBaseUrl = 'http://localhost:3000';
}

module.exports = {
  apiBaseUrl,
  uiBaseUrl,
}
