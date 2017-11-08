// @preval
const { dirname, resolve, join } = require('path')
const findUp = require('find-up')
const rc = require('rc')
const { name } = require('./package.json')

const root = dirname(findUp.sync('package.json'))
const picturebookPath = 'node_modules/picturebook/'
const config = rc(name, {
  projectName: 'PictureBook',
  entryPoint: join(picturebookPath, 'index.js'),
  markdownFooter: join(picturebookPath, 'shared/storyFolders/footer.md'),
  projectUrl: 'https://github.com/obartra/picturebook',
  picturebookPath,
  root,
})
;['markdownFooter', 'storyPath', 'entryPoint', 'postcssConfig', 'jestConfig', 'picturebookPath'].forEach(key => {
  if (key in config) {
    config[key] = resolve(config.root, config[key])
  }
})


module.exports = config
