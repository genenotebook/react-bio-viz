const path = require("path");
const config = require("./webpack.config.js");
// const StaticSiteGeneratorPlugin =
//   require('static-site-generator-webpack-plugin');

const developmentOptions = {
  entry: {
    main: path.resolve(__dirname, "demo/index.tsx"),
  },
  output: {
    filename: "app_bundle.js",
    path: path.resolve(__dirname, "app_dist"),
    globalObject: "this",
    // libraryTarget: 'commonjs2'
  },
  externals: undefined,
};

module.exports = Object.assign(config, developmentOptions);
