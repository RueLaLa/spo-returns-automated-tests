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

  function confirmVersionFromHeaders(headers, expectedVersion) {
    const requireExactVersion = !!expectedVersion;
    // force list to lowercase
    const headerList = Object.keys(headers).map((header) => header.toLowerCase());
    assert.strictEqual(headerList.includes('x-version'), true);
    const caseInsensitiveHeaders = Object.keys(headers).reduce((obj, header) => {
      return {
        ...obj,
        [header.toLowerCase()]: headers[header],
      }
    }, {});
    const versionInfoText = caseInsensitiveHeaders['x-version'];
    if (requireExactVersion) {
      assert.strictEqual(versionInfoText, expectedVersion);
    } else {
      assert.strictEqual(/^(feature\/.*|bugfix\/.*|release|master|main):.*/.test(versionInfoText), true);
    }
  }

  it('checks the version returned in the header', async function () {
    // do not run this on local host, we don't have version information in the dev env
    if (apiBaseUrl.indexOf('localhost') < 0) {
      const expectedVersion = process.env.API_VERSION;

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await axios.get(`${apiBaseUrl}/orders?orderNum=1&email=test@test.com&zip=11111`, config)
        .then((response) => {
          confirmVersionFromHeaders(response.headers, expectedVersion);
        })
        .catch((error) => {
          if (error.response) {
            confirmVersionFromHeaders(error.response.headers, expectedVersion);
          } else {
            console.log(`Unexpected error from API: ${error.message}`);
            assert.ok(false, error.message);
          }
        });

    } else {
      assert.ok(true, 'This is localhost and version will not be present');
    }
  });
});
