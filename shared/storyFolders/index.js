/* eslint-disable global-require, import/no-dynamic-require */
const { loadWebpack } = require('./webpack')

const isTest =
process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'test:image'

const storyFolders = loadWebpack(
  require.context(preval`module.exports=require('../../params').storyPath`),
  true,
  /.+\.(md|png|js)$/i
)

module.exports = { storyFolders }
