const merge = require('webpack-merge')
const webpack = require('webpack')

const css = require('./helpers/css')
const analyzer = require('./helpers/analyzer')
const plugin = require('./helpers/plugin')
const base = require('./webpack.base')
const { src } = require('./env')

const defaultInclude = src

module.exports = (env = {}) => {
  const isProduction = env.production === true
  const mode = !isProduction ? 'development' : 'production'
  process.env.NODE_ENV = mode

  return merge([
    base,
    env.react || {
      resolve: {
        alias: {
          react: 'anujs',
          'react-dom': 'anujs',
          'create-react-class': 'anujs/lib/createClass',
          'prop-types': 'anujs/lib/ReactPropTypes',
        },
      },
    },
    { mode },
    plugin(
      new webpack.DefinePlugin({
        'process.env.REACT': env.react ? 'true' : 'false',
      })
    ),
    css({
      rule: {
        test: /\.css$/,
        exclude: defaultInclude,
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
        test: /\.css$/,
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
    isProduction ? require('./webpack.prod') : require('./webpack.dev'),
  ])
}
