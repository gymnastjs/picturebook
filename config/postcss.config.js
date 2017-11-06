const cssImport = require('postcss-import')
const cssNano = require('cssnano')
const cssNesting = require('postcss-nesting')
const cssNext = require('postcss-cssnext')
const cssFlexFix = require('postcss-flexbugs-fixes')
const { postcssConfig, root } = require('../params')
const userConfig = require('/Users/obartra/repos/reflex/scripts/postcss.config.js')

module.exports = {
  plugins: [
    cssImport({
      root,
    }),
    cssNesting(),
    cssNext({
      features: {
        autoprefixer: false,
      },
    }),
    cssNano(),
    cssFlexFix(),
  ],
}
