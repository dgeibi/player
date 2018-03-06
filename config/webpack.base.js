const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { dist } = require('./env')

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    path: dist,
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/template.ejs',
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/assets/',
      },
    ]),
  ],
}
