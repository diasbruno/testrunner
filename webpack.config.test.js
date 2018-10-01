/* global require, module, __dirname */

const path = require('path');
const webpack = require('webpack');

const output = {
  filename: 'mehc.js',
  path: path.resolve(__dirname, ".")
};

const testRunnerProcess = new (require('./index'))(
  "localhost", 5001, output
);

module.exports = {
  target: "web",
  mode: 'development',
  watch: true,
  entry: './test.js',
  output,
  module: { rules: [] },
  plugins: [testRunnerProcess]
};
