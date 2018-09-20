const { resolve } = require('path')
const { merge } = require('lodash')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const path = resolve(__dirname, 'dist')
const shared = {
  output: {
    path,
    library: 'picturebook',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: {
    module: true,
  },
  plugins: [new CleanWebpackPlugin([path])],
}
const webpackMerge = config => merge({}, shared, config)

const browser = webpackMerge({
  target: 'web',
  entry: { main: './src' },
  output: {
    filename: 'picturebook.web.js',
    libraryTarget: 'umd',
  },
  resolve: {
    mainFiles: ['browser', 'index'],
  },
})

const node = webpackMerge({
  target: 'node',
  entry: { main: './src' },
  output: {
    filename: 'picturebook.node.js',
  },
})

module.exports = [browser, node]
