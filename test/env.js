// stub for rAF until jest makes the polyfill available by default
// https://github.com/facebook/jest/pull/4568
global.requestAnimationFrame = jest.fn().mockImplementation(() => {
  throw new Error('requestAnimationFrame is not supported in Node')
})
