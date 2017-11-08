/* eslint-disable global-require, import/no-dynamic-require */
const { root, picturebookPath, jestConfig} = require('./params')

let extend = {}
if (jestConfig) {
  extend = require(jestConfig)
}

module.exports = {
  ...extend,
  rootDir: root,
  collectCoverageFrom: ['<rootDir>/src/{,**/}*.js'],
  setupFiles:
    [`${picturebookPath}/test/env.js`, ...(extend.setupFiles || [])],
  moduleNameMapper: {
    '^.+[.]css$': `${picturebookPath}/test/identityStub.js`,
    '^.+[.](md|txt)$': `${picturebookPath}/test/stringStub.js`,
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!picturebook)'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/(?!picturebook)'],
  testMatch: [`${picturebookPath}/test/*.spec.js`, ...(extend.testMatch || [])],
  verbose: true
}
