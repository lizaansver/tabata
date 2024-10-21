const webpack = require('webpack');

module.exports = {
  //...
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
      setImmediate: 'setimmediate',
      clearImmediate: 'clearimmediate',
      timers: 'timers-browserify'
    })
  ],
  resolve: {
    fallback: {
      "timers": require.resolve("timers-browserify")
    }
  }
};