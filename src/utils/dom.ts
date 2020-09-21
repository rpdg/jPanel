export function select(selector: string, context?: HTMLElement): HTMLElement[] {
	return Array.prototype.slice.call((context || document).querySelectorAll(selector));
}


export function probe(){
	let body :HTMLElement = document.body;
	
	const {clientHeight , clientWidth} = document.body;
	console.log(clientWidth + ' x ' + clientHeight + '; PixelRatio: ' + window.devicePixelRatio);


	if(!body.classList){
		console.warn('classList not supported');
	}
	else{
		console.log('classList supported');
	}

	if(!body.querySelectorAll){
		console.warn('querySelectorAll not supported');
	}
	else{
		console.log('querySelectorAll supported');
	}

	if(!body.getBoundingClientRect){
		console.warn('getBoundingClientRect not supported');
	}
	else{
		console.log('getBoundingClientRect supported');
	}

	if(!window.Promise){
		console.warn('window.Promise not supported');
	}
	else{
		console.log('Promise supported');
	}


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

export const on = function (evn: string, fn: Function, addToHead: boolean = false): number {
	let handlerSeed: number;
	if (addToHead) {
		handlerSeed = --seedMin;
		seeds.unshift(handlerSeed);
	} else {
		handlerSeed = ++seedMax;
		seeds.push(handlerSeed);
	}
	listeners[handlerSeed] = fn;
	//fn.seed = seed ;
	return handlerSeed;
};

export const off = function (handlerSeed: number) {
	let b = false;
	let ss = seeds;
	for (let i = 0, l = ss.length; i < l; i++) {
		if (ss[i] == handlerSeed) {
			ss.splice(i, 1);
			delete listeners[handlerSeed];
			b = true;
			break;
		}
	}
	return b;
};

export const once = function (evt: string, cb: Function, addToHead?: boolean) {
	let hdlSeed = on(
		evt,
		function (event: Event) {
			off(hdlSeed);
			hdlSeed = null;
			return cb.call(window, event);
		},
		addToHead
	);

	return hdlSeed;
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
