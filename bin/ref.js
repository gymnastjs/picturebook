/* eslint-disable */
const { resolve } = require('path')
const { spawnSync } = require('child_process');

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
    const params = ['--config', nightwatchDir].concat(process.argv.slice(2))

    spawnSync('./node_modules/.bin/nightwatch', params, {
      stdio: 'pipe'
    })
  }
}
