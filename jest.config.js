module.exports = {
  rootDir: __dirname,
  setupTestFrameworkScriptFile: '<rootDir>/test/env.js',
  testMatch: ['<rootDir>/src/**/*.spec.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/sampleFolder'],
  moduleNameMapper: {
    '\\.(jpg|png|md)$': '<rootDir>/test/mocks/file.js',
  }
}
