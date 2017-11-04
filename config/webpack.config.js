const { resolve } = require('path')
const { root } = require('../params')

module.exports = (baseConfig, env) => {
  const jsConfig = Object.assign(baseConfig.module.rules[0], {
    include: [
      ...baseConfig.module.rules[0].include,
      // resolve(__dirname, '..'), // dev only
      resolve(root, 'node_modules/picturebook'),
    ],
    exclude: [],
  })
  baseConfig.node = {
    fs: 'empty',
  }
  baseConfig.resolve.alias = {
    PropTypes: 'prop-types',
  }
  baseConfig.module.rules = [
    jsConfig,
    {
      test: /\.png$/,
      use: 'ignore-loader',
    },
    {
      test: /\.txt$/,
      use: 'raw-loader',
    },
    {
      test: /\.md$/,
      use: [
        {
          loader: 'html-loader',
        },
        {
          loader: 'markdown-loader',
        },
      ],
    },
    {
      test: /\.css$/,
      include: resolve(__dirname, '../../'),
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            camelCase: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            config: {
              path: resolve(root, 'scripts/postcss.config.js'),
            },
          },
        },
      ],
    },
  ]

  return baseConfig
}
