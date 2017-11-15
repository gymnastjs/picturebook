/* eslint-disable global-require, import/no-dynamic-require */
const { readFileSync } = require('fs')
const { babelConfig } = require('../params')

let config = {
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": ["last 2 versions", "ie >= 11"]
        }
      }
    ],
    "react"
  ],
  "plugins": [
    "preval",
    "lodash",
    "transform-object-rest-spread",
    "transform-class-properties",
  ]
}

if (babelConfig) {
  config = JSON.parse(readFileSync(babelConfig, "utf8"));
}

module.exports = config
