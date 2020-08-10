export type KeyMap = {
	[code: string]: string;
};

export const KEY_NAMES = {
	up: 'up',
	down: 'down',
	left: 'left',
	right: 'right',
	ok: 'ok',
};

export const KEY_CODE_MAPS = {
	'37': KEY_NAMES.left,
	'39': KEY_NAMES.right,
	'38': KEY_NAMES.up,
	'40': KEY_NAMES.down,
	'13': KEY_NAMES.ok,
};

export const EMPTY_FUNC = () => {};
