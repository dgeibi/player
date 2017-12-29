module.exports = enable => {
  if (enable) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    return {
      plugins: [new BundleAnalyzerPlugin()],
    }
  }
  return false
}
