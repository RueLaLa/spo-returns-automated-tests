'use strict';
const assert = require('assert');
const axios = require('axios');

describe('Version test of SPO-Returns API', function () {
  let apiBaseUrl;
  before(function () {
    apiBaseUrl = process.env.RETURNS_API_URL;
    if (!apiBaseUrl) {
      apiBaseUrl = 'http://localhost:7071/api';
    }
  });

  it('checks the version returned in the header', async function () {
    // do not run this on local host, we don't have version information in the dev env
    if (apiBaseUrl.indexOf('localhost') >= 0) {
      let expectedVersion = process.env.API_VERSION;
      let exactVersion = !!expectedVersion;

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.get(`${apiBaseUrl}/returns?orderId=1`, config);
      // force list to lowercase
      const headerList = Object.keys(response.headers).map((header) => header.toLowerCase());
      assert.strictEqual(headerList.includes('x-version'), true);
      const caseInsensitiveHeaders = Object.keys(response.headers).reduce((obj, header) => {
        return {
          ...obj,
          [header.toLowerCase()]: response.headers[header],
        }
      }, {});
      const versionInfoText = caseInsensitiveHeaders['x-version'];
      if (exactVersion) {
        assert.strictEqual(versionInfoText, expectedVersion);
      } else {
        assert.strictEqual(/^(feature\/.*|bugfix\/.*|release|master|main):.*/.test(versionInfoText), true);
      }
    } else {
      assert.ok(true, 'This is localhost and version will not be present');
    }
  });
});
