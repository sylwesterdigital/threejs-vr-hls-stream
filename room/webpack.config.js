const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const path = require("path");

module.exports = {
  
  entry: "./src/app.js",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  
  devServer: {
    historyApiFallback: true,
    open: true,
    compress: false,
    hot: true,
    https: true,
    host: '0.0.0.0',
    port: 3333,
  }, 

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },      
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template:'src/index.html',
      title: 'DRAGONS AND ROBOTS',
      output: 'index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ],
    }),    
  ]
};
