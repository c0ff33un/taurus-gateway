const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, './node_modules')],
        test: /\.js$/,
      }
    ]
  },
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js']
  },
  target: 'node'
}
