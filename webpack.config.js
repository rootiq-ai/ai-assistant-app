const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/module.ts',
  output: {
    filename: 'module.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'amd',
    publicPath: '/',
  },
  externals: [
    'lodash',
    'react',
    'react-dom',
    '@grafana/data',
    '@grafana/ui',
    '@grafana/runtime',
    function ({ request }, callback) {
      const prefix = 'grafana/';
      if (request && request.startsWith(prefix)) {
        return callback(null, request.slice(prefix.length));
      }
      callback();
    },
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/plugin.json', to: '.' },
        { from: 'src/img', to: 'img', noErrorOnMissing: true },
        { from: 'README.md', to: '.', noErrorOnMissing: true },
        { from: 'CHANGELOG.md', to: '.', noErrorOnMissing: true },
        { from: 'LICENSE', to: '.', noErrorOnMissing: true },
      ],
    }),
  ],
};
