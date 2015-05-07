var webpack = require('webpack');

module.exports = {
    entry: './node_modules/react/addons.js',
    output: {
        library: "React",
        libraryTarget: "umd",
        path: __dirname + '/dist',
        filename: 'react.js'
    },
    module: {
        loaders: [
            { test: /\.(js)$/, exclude: /node_modules/, loader: require.resolve('babel-loader') }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
};
