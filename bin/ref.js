/* eslint-disable */
const { resolve } = require('path')

const pictureDir = resolve(__dirname, '../')
const configDir = resolve(pictureDir, 'config')
const nightwatchDir = resolve(pictureDir, 'test/screenshot/nightwatch.conf.js')

console.log(`

🤖 📗  PICTUREBOOK

- script is at ${__dirname}
- picturebook is at ${pictureDir}
- picturebook config is at ${configDir}
- nighwatch config is at ${nightwatchDir}
`)

module.exports = {
  start() {
    process.argv.push('-c', configDir)
    require('@storybook/react/dist/server')
  },
  build() {
    process.argv.push('-c', configDir)
    require('@storybook/react/dist/server/build')
  },
  image() {
    process.argv.push('--config ', nightwatchDir)
    require('nightwatch/runner.js')
  }
}
