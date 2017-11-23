const { find } = require('lodash')
const { browsers } = require('../../../params')

function getBrowserData(browserName) {
  const match = find(
    browsers,
    (browser, key) =>
      browser.desiredCapabilities.browserName === browserName ||
      key === browserName
  )

  if (match) {
    return match.custom_vars
  }

  return {}
}

module.exports = {
  getBrowserData,
}
