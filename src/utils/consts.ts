﻿export const KEY_MAPS = {
	'37': 'left',
	'39': 'right',
	'38': 'up',
	'40': 'down',
	'13': 'ok',
};

export const EMPTY_FUNC = () => {};

export type KeyMap = {
	[code: string]: string;
};
