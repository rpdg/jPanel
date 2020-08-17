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

export const Browser = window.navigator.userAgent;
export const IsDesktop = Browser.indexOf('Windows; U;') === -1;
export const Version = '0.21';

export const request = (function () {
	let ret: any = {},
		a = window.location,
		seg = a.search.replace(/^\?/, '').split('&'),
		len = seg.length,
		i = 0,
		s;
	for (; i < len; i++) {
		if (!seg[i]) continue;
		s = seg[i].split('=');
		ret[s[0]] = s[1];
	}
	return ret;
})();
