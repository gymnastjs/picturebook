// @preval
const { dirname, resolve, join } = require('path')
const findUp = require('find-up')
const cosmiconfig = require('cosmiconfig')
const { name } = require('./package.json')
const browsers = require('./browsers')
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
  desktopReferenceBrowser: 'chrome',
  mobileReferenceBrowser: 'iphone7',
  referenceThreshold: 0,
  browserThreshold: 3.7,
  browsers,
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
