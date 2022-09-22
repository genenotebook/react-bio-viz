const path = require("path");
const baseConfig = require("./webpack.config.js");

module.exports = Object.assign(baseConfig, {
  entry: {
    main: path.resolve(__dirname, "demo/index.tsx"),
  },
  output: {
    filename: "dev_bundle.js",
    globalObject: "this",
  },
  mode: "development",
  externals: undefined,
  devtool: "inline-source-map",
  devServer: {
    open: true,
    hot: true,
    static: {
      directory: path.resolve(__dirname, "demo"),
    },
    devMiddleware: {
      publicPath: "/dist/",
    },
  },
});
