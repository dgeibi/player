const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath: '../',
            },
          },
        ],
        include: defaultInclude,
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
