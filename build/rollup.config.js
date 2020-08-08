// const path = require('path');
// const typescript = require('rollup-plugin-typescript2');
import path from 'path';
import typescript from 'rollup-plugin-typescript2';

function resolveFile(filePath) {
	return path.join(__dirname, '..', filePath);
}

export default [
	{
		input: resolveFile('src/index.ts'),
		output: {
			dir: resolveFile('dist'),
			format: 'iife',
			name: 'jbox',
			sourcemap: true,
		},
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
			}),
		],
	},
];
