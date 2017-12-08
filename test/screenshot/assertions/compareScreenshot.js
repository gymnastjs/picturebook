const resemblejs = require('node-resemble-js')
const { some } = require('lodash')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const { getBrowserData } = require('../shared')

function makeDir(dirPath) {
  return mkdirp.sync(dirPath)
}

function compareImages(baselinePath, resultPath, callback) {
  resemblejs.outputSettings({
    errorColor: {
      red: 225,
      green: 0,
      blue: 255,
    },
    errorType: 'movement',
    transparency: 0.1,
    largeImageThreshold: 1200,
  })

  resemblejs(baselinePath)
    .compareTo(resultPath)
    .onComplete(callback)
}

exports.assertion = function assertion(filename, baselinePath, browserName) {
  const screenshotPath = 'test/screenshot/images'
  const { platform } = getBrowserData(browserName)
  const resultPath = `${screenshotPath}/results/${browserName}-${filename}`
  const diffPath = `${screenshotPath}/diffs/${browserName}-${filename}`

  function updateBaseline({ message } = {}) {
    if (
      (platform === 'desktop' && browserName === 'chrome') ||
      (platform === 'mobile' && browserName === 'iphone7')
    ) {
      if (message) {
        process.stdout.write(message)
      }

      fs.writeFileSync(baselinePath, fs.readFileSync(resultPath))
    }
  }

  this.message = 'Unexpected compareScreenshot error.'
  this.expected = browserName === 'chrome' ? 0 : 3.7 // misMatchPercentage tolerance 3.0% for non chrome

  this.command = callback => {
    makeDir(path.dirname(resultPath))
    makeDir(path.dirname(diffPath))
    makeDir(path.dirname(baselinePath))

    // create new baseline photo if none exists
    if (!fs.existsSync(baselinePath)) {
      // baseline is chrome for desktop, iphone for mobile

      updateBaseline({ message: 'Image did not exist, updating test...\n' })
    }

    if (fs.existsSync(baselinePath)) {
      compareImages(baselinePath, resultPath, callback)
    } else {
      callback(false)
    }

    return this
  }

  this.value = result => {
    if (result) {
      result
        .getDiffImage()
        .pack()
        .pipe(fs.createWriteStream(diffPath))
      return parseFloat(result.misMatchPercentage, 10) // value this.pass is called with
    }
    return 0
  }

  this.pass = function passFn(value) {
    let pass = value <= this.expected

    if (
      pass === false &&
      some(
        ['-u', '--updateScreenshot'],
        flag => process.argv.indexOf(flag) > -1
      )
    ) {
      updateBaseline()
      this.message = `Updating screenshot at ${baselinePath}\n`

      pass = true
    } else if (pass === true) {
      this.message = `Screenshots Matched for ${filename} with a tolerance of ${
        this.expected
      }%.`
    } else if (pass === false) {
      this.message =
        `Screenshots Match Failed for ${filename} with a tolerance of ${
          this.expected
        }%.\n` +
        `   Screenshots at:\n` +
        `      Baseline: ${baselinePath}\n` +
        `      Result: ${resultPath}\n` +
        `      Diff: ${diffPath}\n` +
        `   Open ${diffPath} to see how the screenshot has changed.\n` +
        `   If the Result Screenshot is correct you can use it to update the Baseline Screenshot and re-run your test:\n` +
        `    cp ${resultPath} ${baselinePath}`
    } else {
      this.message = `Screenshot results not collected for this browser`
      return false
    }
    return pass
  }
}
