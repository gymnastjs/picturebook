const { resolve } = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const path = resolve(__dirname, 'dist')

module.exports = {
  output: {
    path,
    filename: 'picturebook.web.js',
    libraryTarget: 'umd',
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
  plugins: [new CleanWebpackPlugin([path])],
  target: 'web',
  entry: { main: './src' },
  resolve: {
    mainFiles: ['browser', 'index'],
  },
}
