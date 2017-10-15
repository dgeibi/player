const merge = require('webpack-merge')
const path = require('path')

const css = require('./config/css')
const defineNodeEnv = require('./config/defineNodeEnv')
const base = require('./webpack.config.base')

const defaultInclude = [path.resolve(__dirname, 'src')]

module.exports = (env = {}) => {
  const isProduction = env.production === true
  const nodeEnv = !isProduction ? 'developement' : 'production'
  process.env.NODE_ENV = nodeEnv

  const common = merge([
    base,
    defineNodeEnv(nodeEnv),
    css({
      rule: {
        test: /\.less$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
          'less-loader',
        ],
      },
      extract: true,
      extractOptions: 'antd.css',
    }),
    css({
      rule: {
        test: /\.scss$/,
        include: defaultInclude,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
        ],
      },
      extract: isProduction,
      extractOptions: 'main.css',
    }),
  ])

  if (isProduction) {
    return merge(common, require('./webpack.config.prod'))
  }
  return merge(common, require('./webpack.config.dev'))
}
