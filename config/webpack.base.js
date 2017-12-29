const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const customCamel2Dash = require('./babel/customCamel2Dash')

const { dist, src } = require('./env')

const defaultInclude = src

module.exports = {
  entry: {
    app: './src/index.js',
  },
  resolve: {
    alias: {
      react: 'anujs',
      'react-dom': 'anujs',
      'create-react-class': 'anujs/lib/createClass',
    },
  },
  output: {
    path: dist,
    filename: '[name].js',
    chunkFilename: '[name].js',
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
              {
                libraryName: 'antd',
                style: 'css',
              },
            ],
            [
              'import',
              customCamel2Dash({
                libraryName: 'react-feather',
                libraryDirectory: 'dist/icons',
              }),
              'react-feather-import',
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
    new CopyWebpackPlugin([
      {
        from: 'src/assets/',
      },
    ]),
  ],
}
