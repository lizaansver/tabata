const webpack = require('webpack');

module.exports = {
  // другие настройки Webpack
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      // другие правила
    ],
  },
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
