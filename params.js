// @preval
const { dirname, resolve, join } = require('path')
const findUp = require('find-up')
const cosmiconfig = require('cosmiconfig')
const { name } = require('./package.json')
const seleniumPath = require('selenium-server-standalone-jar').path;

const root = dirname(findUp.sync('package.json'))
const picturebookPath = 'node_modules/picturebook/'
const explorer = cosmiconfig(name, {
  cache: false,
  sync: true
})
const config = Object.assign({}, {
  entryPoint: join(picturebookPath, 'index.js'),
  image: {},
  markdownFooter: join(picturebookPath, 'shared/storyFolders/footer.md'),
  picturebookPath,
  projectName: 'PictureBook',
  skip: [],
  projectUrl: 'https://github.com/obartra/picturebook',
  root,
  seleniumPath,
  browsers: {
    chrome: {
      desiredCapabilities: {
        platform: 'macOS 10.12',
        version: 'latest',
        browserName: 'chrome',
        chromedriverVersion: '2.24',
        screenResolution: '1280x960',
      },
      custom_vars: {
        name: 'chrome',
        platform: 'desktop',
        extract: {
          top: 0,
          left: 0,
          width: 1280,
          height: 854,
        },
      },
    },
    ie11: {
      desiredCapabilities: {
        platform: 'Windows 10',
        version: '11.103',
        browserName: 'internet explorer',
        screenResolution: '1280x960',
      },
      custom_vars: {
        name: 'ie',
        platform: 'desktop',
        extract: {
          top: 0,
          left: 0,
          width: 1280,
          height: 854,
        },
      },
    },
    edge: {
      desiredCapabilities: {
        platform: 'Windows 10',
        version: '14.14393',
        browserName: 'MicrosoftEdge',
        screenResolution: '1280x960',
      },
      custom_vars: {
        name: 'edge',
        platform: 'desktop',
        extract: {
          top: 0,
          left: 0,
          width: 1280,
          height: 854,
        },
      },
    },
    firefox: {
      desiredCapabilities: {
        platform: 'macOS 10.12',
        version: '54.0',
        browserName: 'firefox',
        screenResolution: '1280x960',
      },
      custom_vars: {
        name: 'firefox',
        platform: 'desktop',
      },
    },
    safari: {
      desiredCapabilities: {
        platform: 'macOS 10.12',
        version: '11.0',
        browserName: 'safari',
        screenResolution: '1280x960',
      },
      custom_vars: {
        name: 'safari',
        platform: 'desktop',
        extract: {
          top: 0,
          left: 0,
          width: 1280,
          height: 854,
        },
      },
    },
    iphone7: {
      desiredCapabilities: {
        appiumVersion: '1.6.5',
        browserName: 'Safari',
        deviceName: 'iPhone 7 Plus Simulator',
        deviceOrientation: 'portrait',
        platformName: 'iOS',
        platformVersion: '10.3',
      },
      custom_vars: {
        name: 'iphone7',
        platform: 'mobile',
        extract: {
          top: 193,
          left: 0,
          width: 1242,
          height: 1882,
        },
      },
    },
    galaxy4: {
      desiredCapabilities: {
        browserName: 'Browser',
        appiumVersion: '1.6.5',
        deviceName: 'Samsung Galaxy S4 GoogleAPI Emulator',
        deviceOrientation: 'portrait',
        platformVersion: '4.4',
        platformName: 'Android',
      },
      custom_vars: {
        name: 'galaxy4',
        platform: 'mobile',
        extract: {
          top: 154,
          left: 0,
          width: 720,
          height: 1126,
        },
      },
    },
  },
}, explorer.load('.').config)

;[
  'babelConfig',
  'entryPoint',
  'markdownFooter',
  'picturebookPath',
  'postcssConfig',
  'storyPath',
  'wrapStory',
  'webpackConfig',
].forEach(key => {
  if (key in config) {
    config[key] = resolve(config.root, config[key])
  }
})

config.image.desiredCapabilities = config.image.desiredCapabilities || {}

module.exports = config
