const { image } = require('../../../params')
const SauceLabs = require('saucelabs')

exports.command = function seleniumEnd(callback) {
  const saucelabs = new SauceLabs({
    username: image.username,
    password: image.accessKey,
  })
  const sessionId = this.capabilities['webdriver.remote.sessionid']
  const { name } = this.currentTest
  const passed = this.currentTest.results.failed === 0

  saucelabs.updateJob(sessionId, { passed, name }, callback)

  return this
}
