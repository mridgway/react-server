var webpack = require('webpack');

module.exports = {
    entry: './index.js',
    output: {
        library: "React",
        libraryTarget: "umd",
        path: __dirname + '/dist',
        filename: 'react-server.js'
    },
    module: {
        loaders: [
            { test: /\.(js)$/, exclude: /node_modules/, loader: require.resolve('babel-loader') }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};
