const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const pkg = require('./package')
const customCamel2Dash = require('./config/babel/customCamel2Dash')

const DIST_DIR = path.resolve(__dirname, pkg.dist_dir)
const defaultInclude = [path.resolve(__dirname, 'src')]

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/index.js',
  },
  output: {
    path: DIST_DIR,
    filename: '[name].js',
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
    new CopyWebpackPlugin([
      {
        from: 'src/assets/',
      },
    ]),
  ],
}
