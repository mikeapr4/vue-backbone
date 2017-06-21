var path = require('path'), webpack = require('webpack'), version = require("./package.json").version;

module.exports = {
		resolve: {
			modules: [path.resolve(__dirname, 'src'), 'node_modules']
		},
		entry: 'vue-backbone.js',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'vue-backbone.js',
			library: 'VueBackbone',
			libraryTarget: 'umd'
		},
		plugins: [
			new webpack.BannerPlugin({banner: 
`Vue-Backbone v${version}
https://github.com/mikeapr4/vue-backbone
@license MIT`
			})
		],
    module: {
        rules: [{ 
            test: /\.js$/, 
            exclude: [/node_modules/], 
            loader: 'babel-loader'
        }]
    }
};