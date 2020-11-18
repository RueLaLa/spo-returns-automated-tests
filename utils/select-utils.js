'use strict';

const assert = require('assert');
const { By } = require('selenium-webdriver')

module.exports.selectByValue = async (selectElem, valueDesired) => {
  const options = await selectElem.findElements(By.css('option'));
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const value = await option.getAttribute('value');
    if (value === valueDesired) {
      await option.click();
    }
  }
}

module.exports.assertValueIsSelected = async (selectElem, expectedValue) => {
  let foundSelectedValue = undefined;

  const options = await selectElem.findElements(By.css('option'));
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const selected = await option.isSelected();
    if (selected) {
      foundSelectedValue = await option.getAttribute('value');
    }
  }
  expect(foundSelectedValue).toEqual(expectedValue);
}
