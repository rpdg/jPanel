// const path = require('path');
// const typescript = require('rollup-plugin-typescript2');
import pkg from '../package.json';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';

function resolveFile(filePath) {
	return path.join(__dirname, '..', filePath);
}

export default [
	{
		input: resolveFile('src/index.ts'),
		output: [
			{
				file: pkg.browser,
				format: 'iife',
				name: 'x$'
			},
			{
				file: pkg.module,
				format: 'es', // the preferred format
			},
			{
				file: pkg.main,
				format: 'cjs',
			},
		],
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
			}),
		],
	},
];
