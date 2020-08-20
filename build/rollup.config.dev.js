process.env.NODE_ENV = 'development';

import path from 'path';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import configList from './rollup.config';

const resolveFile = function (filePath) {
	return path.join(__dirname, '..', filePath);
};

const PORT = 3000;

const devSite = `http://127.0.0.1:${PORT}`;
const devPath = path.join('demo', 'index.html');
const devUrl = `${devSite}/${devPath}`;

setTimeout(() => {
	console.log(`[dev]: ${devUrl}`);
}, 1000);

configList.map((config, index) => {
	config.output.sourcemap = true;

	if (index === 0) {
		config.plugins = [
			...config.plugins,
			...[
				serve({
					port: PORT,
					contentBase: ['.', 'dist'],
					open: true,
					openPage: `/demo/index.html`,
				}),
				livereload({
					watch: [
						path.resolve(__dirname, 'demo'),
						path.resolve(__dirname, 'dist'),
						path.resolve(__dirname, 'src'),
					],
					exts: ['html', 'js', 'ts', 'scss', 'css'],
				}),
			],
		];
	}

	return config;
});

export default configList;
