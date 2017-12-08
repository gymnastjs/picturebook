const { resolve, join } = require('path')
const webpack = require('webpack')
const { root, postcssConfig, webpackConfig } = require('../params')

module.exports = (baseConfig, env) => {
  const picturebookPath = resolve(root, 'node_modules/picturebook')
  const jsConfig = Object.assign(baseConfig.module.rules[0], {
    include: [...baseConfig.module.rules[0].include, picturebookPath],
    exclude: [join(picturebookPath, '/node_modules')],
  })

  const ignoreContextRegex = new RegExp(picturebookPath + '/shared/storyFolders')

  baseConfig.plugins.push(new webpack.IgnorePlugin(/test/, ignoreContextRegex))

  baseConfig.node = {
    fs: 'empty',
  }
  baseConfig.resolve.alias = {
    PropTypes: 'prop-types',
  }
  baseConfig.module.rules = [
    jsConfig,
    {
      test: /\.spec\.png$/,
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
      include: [root, picturebookPath],
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
              path: postcssConfig,
            },
          },
        },
      ],
    },
  ]

  if (webpackConfig) {
    return require(webpackConfig)(baseConfig, env)
  }

  return baseConfig
}
