/* eslint-disable global-require, import/no-dynamic-require */
const { storyPath } = require('../../params')

const { loadWebpack } = require('./webpack')

const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'test:image'

let storyFolders

if (!isTest) {
  storyFolders = loadWebpack(
    require.context(preval`module.exports=require('../../params').storyPath`),
    true,
    /.+\.(md|png|js)$/i
  )
} else {
  const { loadTest } = require('./test')
  storyFolders = loadTest(storyPath)
}

module.exports = { storyFolders }
