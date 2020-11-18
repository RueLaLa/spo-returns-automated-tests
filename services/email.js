'use strict';

const { v4: uuidV4 } = require('uuid');
const { Client } = require('mailsac');

const msClient = new Client(process.env.MAILSAC_API_KEY);
const msDomain = !!process.env.MAILSAC_DOMAIN ? process.env.MAILSAC_DOMAIN : 'mailsac.com';

module.exports.getEmail = async (maxTries = 5) => {
  let freeEmail = undefined;
  let attempt = 0;
  while (!freeEmail && attempt < maxTries) {
    const email = `smoke-test-${uuidV4()}@${msDomain}`;
    const availability = await msClient.checkAddressOwnership(email);
    if (availability.available) {
      freeEmail = email;
    }
    attempt++;
  }
  return freeEmail;
}

module.exports.getEmailMessages = async (emailAddress) => {
  return msClient.getMessages(emailAddress);
}
