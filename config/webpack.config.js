const merge = require('webpack-merge')

const css = require('./helpers/css')
const analyzer = require('./helpers/analyzer')
const defineNodeEnv = require('./helpers/defineNodeEnv')
const base = require('./webpack.base')
const { src } = require('./env')

const defaultInclude = src

module.exports = (env = {}) => {
  const isProduction = env.production === true
  const nodeEnv = !isProduction ? 'development' : 'production'
  process.env.NODE_ENV = nodeEnv

  const common = merge([
    base,
    defineNodeEnv(nodeEnv),
    css({
      rule: {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
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
    analyzer(env.analyzer),
  ])

  if (isProduction) {
    return merge(common, require('./webpack.prod'))
  }
  return merge(common, require('./webpack.dev'))
}
