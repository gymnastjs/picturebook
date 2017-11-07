/* eslint-disable global-require, import/no-dynamic-require */
const { root, jestConfig} = require('./params')

let extend = {}
if (jestConfig) {
  extend = require(jestConfig)
}

module.exports = {
  roots: [root, __dirname],
  collectCoverageFrom: ['<rootDir>/src/{,**/}*.js'],
  setupTestFrameworkScriptFile:
    '<rootDir>/test/env.js',
  moduleNameMapper: {
    '^.+[.]css$': '<rootDir>/test/identityStub.js',
    '^.+[.](md|txt)$': '<rootDir>/test/stringStub.js',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!picturebook)'],
  testMatch: ['<rootDir>/**/?(*.)(spec|test).js'],
  ...extend
}
