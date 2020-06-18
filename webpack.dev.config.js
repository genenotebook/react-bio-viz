const path = require('path');
const config = require('./webpack.config.js');
const StaticSiteGeneratorPlugin =
  require('static-site-generator-webpack-plugin');

const developmentOptions = {
  entry: {
    main: path.resolve(__dirname, 'demo/index.tsx')
  },
  output: {
    filename: 'dev_bundle.js'
  },
  mode: 'development',
  externals: undefined,
  devtool: 'inline-source-map',
  plugins: [
    ...config.plugins,
    new StaticSiteGeneratorPlugin()
  ],
  devServer: {
    open: true,
    hot: true,
    index: path.resolve(__dirname, 'demo/index.tsx')
  }
}

console.log(Object.assign(config, developmentOptions))

module.exports = Object.assign(config, developmentOptions)
