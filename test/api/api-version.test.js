'use strict';

const axios = require('axios');

describe('Version test of SPO-Returns API', () => {
  let apiBaseUrl;
  beforeAll(() => {
    apiBaseUrl = process.env.RETURNS_API_URL;
    if (!apiBaseUrl) {
      apiBaseUrl = 'http://localhost:7071/api';
    }
  });

  function confirmVersionFromHeaders(headers, expectedVersion) {
    const requireExactVersion = !!expectedVersion;
    // force list to lowercase
    const headerList = Object.keys(headers).map((header) => header.toLowerCase());
    expect(headerList.includes('x-version')).toEqual(true);
    const caseInsensitiveHeaders = Object.keys(headers).reduce((obj, header) => {
      return {
        ...obj,
        [header.toLowerCase()]: headers[header],
      }
    }, {});
    const versionInfoText = caseInsensitiveHeaders['x-version'];
    let regex;
    if (requireExactVersion) {
      regex = new RegExp(`^${expectedVersion}$`);
    } else {
      regex = /^(feature\/.*|bugfix\/.*|release|master|main):.*/;
    }
    expect(regex.test(versionInfoText)).toEqual(true);
  }

  /* eslint-disable jest/no-conditional-expect */
  it('checks the version returned in the header', async () => {
    // do not run this on local host, we don't have version information in the dev env
    if (apiBaseUrl.indexOf('localhost') < 0) {
      const expectedVersion = process.env.API_VERSION;

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const url = `${apiBaseUrl}/orders?orderNum=1&email=test@test.com&zip=11111`;
      await axios.get(url, config)
        .then((response) => {
          confirmVersionFromHeaders(response.headers, expectedVersion);
        })
        .catch((error) => {
          if (error.response) {
            confirmVersionFromHeaders(error.response.headers, expectedVersion);
          } else {
            console.error(`Unexpected error from API: ${error.message}`);
            throw error;
          }
        });
    } else {
      console.info('This is localhost and version will not be present in the API headers');
      expect(true).toEqual(true);
    }
  });
  /* eslint-enable jest/no-conditional-expect */
});
