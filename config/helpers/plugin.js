module.exports = instance => ({
  plugins: Array.isArray(instance) ? instance : [instance],
})
