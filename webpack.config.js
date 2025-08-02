const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './background.js',
    'content/content': './content/content.js',
    'popup/popup': './popup/popup.js',
    'options/options': './options/options.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'content/styles.css', to: 'content' },
        { from: 'content/sidebar.html', to: 'content' },
        { from: 'popup/popup.html', to: 'popup' },
        { from: 'popup/popup.css', to: 'popup' },
        { from: 'options/options.html', to: 'options' },
        { from: 'options/options.css', to: 'options' },
        { from: 'assets', to: 'assets' },
      ],
    }),
  ],
  mode: 'production',
  optimization: {
    minimize: false
  }
};
