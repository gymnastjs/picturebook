// @preval
const { dirname, resolve } = require('path')
const findUp = require('find-up')
const rc = require('rc')
const { name } = require('./package.json')

const root = dirname(findUp.sync('package.json'))
const config = rc(name, {
  projectName: 'PictureBook',
  markdownFooter: 'node_modules/picturebook/shared/storyFolders/footer.md',
  projectUrl: 'https://github.com/obartra/picturebook',
  root,
})
;[('markdownFooter', 'storyPath', 'entryPoint')].forEach(key => {
  config[key] = resolve(config.root, config[key])
})

module.exports = config
