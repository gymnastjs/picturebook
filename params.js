// @preval
const { dirname, resolve, join } = require('path')
const findUp = require('find-up')
const cosmiconfig = require('cosmiconfig')
const { name } = require('./package.json')
const browsers = require('./browsers')
const seleniumPath = require('selenium-server-standalone-jar').path;

const root = dirname(findUp.sync('package.json'))
const picturebookPath = 'node_modules/picturebook/'
let explorer = cosmiconfig(name, {
  cache: false,
  sync: true
}).load(__dirname)

if (!explorer) {
  explorer = { config: {}}
}

const config = Object.assign({}, {
  browsers: 'default' in browsers ? browsers.default : browsers,
  browserThreshold: 3.7,
  desktopReferenceBrowser: 'chrome',
  entryPoint: join(picturebookPath, 'index.js'),
  image: {
    accessKey: '',
    desiredCapabilities: {},
    local: false,
    proxy: undefined,
    username: '',
  },
  markdownFooter: join(picturebookPath, 'shared/storyFolders/footer.md'),
  mobileReferenceBrowser: 'iphone7',
  picturebookPath,
  projectName: 'PictureBook',
  projectUrl: 'https://github.com/obartra/picturebook',
  referenceThreshold: 0,
  root,
  seleniumPath,
  skip: [],
}, explorer.config)

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
