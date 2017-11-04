// @preval
const { dirname, resolve } = require('path')
const findUp = require('find-up')
const rc = require('rc')
const { name } = require('./package.json')

const root = dirname(findUp.sync('package.json'))
const config = rc(name, {
  projectName: 'PictureBook',
  projectUrl: 'https://github.com/obartra/picturebook',
  root,
})

config.storyPath = resolve(config.root, config.storyPath)
config.entryPoint = resolve(config.root, config.entryPoint)

module.exports = config
