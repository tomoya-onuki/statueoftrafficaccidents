const Dotenv = require('dotenv-webpack');

module.exports = {
	plugins: [
		// { systemvars: true } を設定するとシステム環境変数も読み込まれるようになる
		new Dotenv({ systemvars: true }),
	],
	mode: "development",
	entry: "./src/main.ts",
	output: {
		path: `${__dirname}/dist`,
		filename: "main.js"
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader"
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	}
};
