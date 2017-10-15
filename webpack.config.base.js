const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const customCamel2Dash = require('./config/babel/customCamel2Dash')

const output = path.resolve(__dirname, 'docs')
const defaultInclude = [path.resolve(__dirname, 'src')]

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/index.js',
  },
  output: {
    path: output,
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: defaultInclude,
        loader: 'babel-loader',
        options: {
          plugins: [
            [
              'import',
              [
                {
                  libraryName: 'antd',
                  style: true,
                },
                customCamel2Dash({
                  libraryName: 'react-feather',
                  libraryDirectory: 'dist/icons',
                }),
              ],
            ],
          ],
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Player',
      template: 'src/template.ejs',
    }),
  ],
}
