module.exports = {
  presets: ['@babel/env', '@babel/react', '@babel/preset-flow'],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-regenerator',
  ],
  env: {
    test: {
      plugins: ['require-context-hook'],
    },
  },
}
