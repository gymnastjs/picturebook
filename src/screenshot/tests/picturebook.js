const { resolve } = require('path')
const PNGCrop = require('png-crop')
const tearDown = require('./teardown')
const { writeLog } = require('../../utils')

const TIMEOUT = 5000

function onError(err) {
  if (err) {
    console.error(err)
  }
}

module.exports = {
  Screenshot: browser => {
    const { files, screenResolution } = browser.options.desiredCapabilities
    const {
      name,
      platform,
      extract,
    } = browser.globals.test_settings.custom_vars
    const { localhostAlias, localhostAliasBrowsers } = browser.globals
    const logs = []

    for (let i = 0; i < files.length; i++) {
      const story = [...files[i].parents, files[i].name].join('/')
      const folderName = `${platform}/${name}`
      const imgFileName = resolve(
        __dirname,
        `../reports/${folderName}/${story}.png`
      )

      logs.push({
        imgFileName,
        name: files[i].name,
        platform,
        browser: name,
      })

      browser
        .url(
          localhostAliasBrowsers.includes(name)
            ? files[i].url.replace('localhost', localhostAlias)
            : files[i].url
        )
        .waitForElementVisible(
          '#root',
          TIMEOUT,
          false,
          ({ value, status }) => {
            if (value) {
              const unCropped = extract
                ? imgFileName.replace('.png', '_uncropped.png')
                : imgFileName

              if (screenResolution) {
                browser.resizeWindow(...screenResolution.split('x'))
              }

              browser
                .execute(() => {
                  document.body.style.overflow = 'hidden'
                  return true
                })
                .saveScreenshot(unCropped, (response, err) => {
                  if (err) {
                    console.error('Failed to save screenshots')
                    return false
                  }
                  if (extract) {
                    PNGCrop.crop(unCropped, imgFileName, extract, onError)
                  }
                  return true
                })
            } else {
              console.log(value, status, name)
            }
          },
          `📸  ${story}`
        )
    }
    browser.end()

    writeLog(`${platform}.${name}`, logs)
  },
  tearDown,
}
