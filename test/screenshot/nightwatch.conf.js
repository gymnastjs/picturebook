require('babel-register')

const path = require('path')
const { merge, mapValues } = require('lodash')
const { browsers, image, seleniumPath } = require('../../params')

const desiredCapabilities = Object.assign(
  {
    acceptSslCerts: true,
  },
  image.desiredCapabilities
)

process.env.NODE_ENV = 'test:image'

if (!image.username || !image.accessKey) {
  throw new Error(`An "image" object with the keys "username", "accessKey" and "selenium" is required to run the image comparison tests. E.g.:

  {
    image: {
      username: 'YourSauceLabsUserName',
      accessKey: 'YourSauceLabsAccessKey
    }
  }
  `)
}

const targetUrl = process.argv[process.argv.indexOf('--url') + 1]
const commonSettings = {
  launch_url: targetUrl,
  selenium_host: image.local ? 'localhost' : 'ondemand.saucelabs.com',
  selenium_port: image.local ? 4445 : 80,
  username: image.username,
  access_key: image.accessKey,
  screenshots: {
    enabled: false,
  },
  desiredCapabilities,
}

module.exports = {
  src_folders: [path.resolve(__dirname, './specs')],
  custom_commands_path: path.resolve(__dirname, './commands'),
  custom_assertions_path: path.resolve(__dirname, './assertions'),
  selenium: {
    start_process: true,
    server_path: seleniumPath,
    cli_args: {
      'webdriver.chrome.driver': '',
      'webdriver.ie.driver': '',
    },
  },
  test_workers: { enabled: true, workers: 'auto' },
  test_settings: Object.assign(
    {
      default: commonSettings,
    },
    mapValues(browsers, browser => merge({}, commonSettings, browser))
  ),
}
