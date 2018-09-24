const requireContext = require('require-context')
const { resolve } = require('path')
const { nightwatchConfig, getFiles } = require('../dist')

const config = nightwatchConfig({
  username: process.env.SAUCE_USERNAME,
  access_key: process.env.SAUCE_ACCESS_KEY,
  files: getFiles({
    baseUrl: 'http://localhost:6006',
    stories: requireContext(resolve(__dirname, './stories'), true, /\.js/),
  }),
  desiredCapabilities: {
    build: 'local',
    'tunnel-identifier': 'picturebook-sample',
  },
})

module.exports = config
