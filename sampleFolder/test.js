require('babel-register')
const test = require('tape')
const requireContext = require('require-context')
const { resolve } = require('path')
const { runTestsWithTunnel, compareImages, getFiles } = require('../src')

const storyRoot = resolve(__dirname, './stories')

function runTests(results) {
  results.forEach(({ platform, browser, name, status }) => {
    test(`${platform}.${browser}.${name}`, t => {
      t.equal(status, 'SUCCESS')
      t.end()
    })
  })
}

runTestsWithTunnel(
  'picturebook-sample',
  resolve(__dirname, 'nightwatch.conf.js')
)
  .then(screenshots => {
    if (!screenshots || !screenshots.length) {
      throw new Error('Screenshots not captured', screenshots)
    }
    return compareImages({
      screenshots,
      root: storyRoot,
      overwrite: true,
      files: getFiles({
        stories: requireContext(storyRoot, true, /\.(js|png)/),
      }),
    })
  })
  .then(runTests)
  .catch(e => {
    console.error('Screenshot capturing failed', e.stack)
  })
