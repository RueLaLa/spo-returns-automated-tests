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

  /* eslint-disable jest/no-conditional-expect */
  it('checks the version returned in the header', async () => {
    // do not run this on local host, we don't have version information in the dev env
    if (apiBaseUrl.indexOf('localhost') < 0) {
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
      expect(headerList.includes('x-version')).toEqual(true);
      const caseInsensitiveHeaders = Object.keys(response.headers).reduce((obj, header) => {
        return {
          ...obj,
          [header.toLowerCase()]: response.headers[header],
        }
      }, {});
      const versionInfoText = caseInsensitiveHeaders['x-version'];
      if (exactVersion) {
        expect(versionInfoText).toEqual(expectedVersion);
      } else {
        expect(/^(feature\/.*|bugfix\/.*|release|master|main):.*/.test(versionInfoText)).toEqual(true);
      }
    } else {
      console.info('This is localhost and version will not be present in the API headers');
      expect(true).toEqual(true);
    }
  });
  /* eslint-enable jest/no-conditional-expect */
});
