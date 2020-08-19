export function select (selector: string, context?: HTMLElement): HTMLElement[] {
	return Array.prototype.slice.call(
		(context || document).querySelectorAll(selector)
	);
}


export const byId = function (str: string) {
	return document.getElementById(str);
};
export const byClass = function (clsName: string, context: HTMLElement) {
	return (context || document).getElementsByClassName(clsName);
};
export const byTag = function (clsName: string, context: HTMLElement) {
	return (context || document).getElementsByTagName(clsName);
};

export const getBoundingClientRect = function (el: HTMLElement) {
	if (el.getBoundingClientRect) return el.getBoundingClientRect();
	let left = 0,
		top = 0,
		width = el.offsetWidth,
		height = el.offsetHeight;
	do {
		left += el.offsetLeft;
		top += el.offsetTop;
	} while ((el = el.offsetParent as HTMLElement));

	return {
		left: Math.round(left),
		top: Math.round(top),
		width: width,
		height: height,
	};
};

export const removeClass = function (elem: HTMLElement, className: string) {
	elem.classList.remove(className);
};

export const addClass = function (elem: HTMLElement, className: string) {
	elem.classList.add(className);
};

export const toggleClass = function (elem: HTMLElement, className: string) {
	return elem.classList.contains(className) ? removeClass(elem, className) : addClass(elem, className);
};

let seeds: number[] = [];
let seedMin = 0;
let seedMax = -1;
let listeners: { [key: number]: Function } = {};

export const on = function (evn: string, fn: Function, addToHead: boolean = false) {
	let seed;
	if (addToHead) {
		seed = --seedMin;
		seeds.unshift(seed);
	} else {
		seed = ++seedMax;
		seeds.push(seed);
	}
	listeners[seed] = fn;
	//fn.seed = seed ;
	return seed;
};

export const off = function (seed: number) {
	let b = false;
	let ss = seeds;
	for (let i = 0, l = ss.length; i < l; i++) {
		if (ss[i] == seed) {
			ss.splice(i, 1);
			delete listeners[seed];
			b = true;
			break;
		}
	}
	return b;
};

export const once = function (evt: string, cb: Function, addToHead?: boolean) {
	let hdl = on(
		evt,
		function (evn: string) {
			off(hdl);
			hdl = null;
			return cb.call(window, evn);
		},
		addToHead
	);

	return hdl;
};

document.onkeydown = function (evt) {
	let ls = listeners,
		ss = seeds.slice();

	for (let i = 0, l = ss.length; i < l; i++) {
		let fn = ls[ss[i]];
		let v = fn.call(window, evt);
		if (v === false) {
			return v;
		}
	}

	/* //Home or Esc
	if ((evt.keyCode == 72 || evt.keyCode == 27) && x$.on.homepage) {
		location.href = on.homepage;
		return false;
	}
	//Backspace
	if (evt.keyCode == 8) {
		if (on.backpage) location.href = on.backpage;
		else history.back();
		return false;
	} */
};
