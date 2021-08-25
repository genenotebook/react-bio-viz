const path = require('path');
const config = require('./webpack.config.js');
const StaticSiteGeneratorPlugin =
  require('static-site-generator-webpack-plugin');

const developmentOptions = {
  entry: {
    main: path.resolve(__dirname, 'demo/index.tsx')
  },
  output: {
    filename: 'dev_bundle.js',
    globalObject: 'this'
  },
  mode: 'development',
  externals: undefined,
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    hot: true,
    static: {
      directory: path.resolve(__dirname, 'demo')
    },
    devMiddleware: {
      publicPath: '/dist/',
    },
  }
}

module.exports = Object.assign(config, developmentOptions)
