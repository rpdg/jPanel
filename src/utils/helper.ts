let seed = 0;

export const componentUid = function (): number {
	return ++seed;
};

/// https://github.com/unclechu/node-deep-extend
function isSpecificValue(val: any) {
	return val instanceof Date || val instanceof RegExp ? true : false;
}

function cloneSpecificValue(val: any) {
	if (val instanceof Date) {
		return new Date(val.getTime());
	} else if (val instanceof RegExp) {
		return new RegExp(val);
	} else {
		throw new Error('Unexpected situation');
	}
}

/**
 * Recursive cloning array.
 */
export const deepCloneArray = function (arr: any[]): any[] {
	let clone: any[] = [];
	arr.forEach(function (item, index) {
		if (typeof item === 'object' && item !== null) {
			if (Array.isArray(item)) {
				clone[index] = deepCloneArray(item);
			} else if (isSpecificValue(item)) {
				clone[index] = cloneSpecificValue(item);
			} else {
				clone[index] = deepExtend({}, item);
			}
		} else {
			clone[index] = item;
		}
	});
	return clone;
};

function safeGetProperty(object: any, property: string) {
	return property === '__proto__' ? undefined : object[property];
}

export function deepExtend<T>(extendTarget: any, ...args: any[]): T {
	if (arguments.length < 1 || typeof arguments[0] !== 'object') {
		throw new Error('no object to deep extend.');
	}

	if (arguments.length < 2) {
		return deepExtend({} as T, arguments[0]);
	}

	let target = extendTarget as any;

	let val, src;

	args.forEach(function (obj) {
		// skip argument if isn't an object, is null, or is an array
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			return;
		}

		Object.keys(obj).forEach(function (key) {
			src = safeGetProperty(target, key); // source value
			val = safeGetProperty(obj, key); // new value

			// recursion prevention
			if (val === target) {
				return;

				/**
				 * if new value isn't object then just overwrite by new value
				 * instead of extending.
				 */
			} else if (typeof val !== 'object' || val === null) {
				target[key] = val;
				return;

				// just clone arrays (and recursive clone objects inside)
			} else if (Array.isArray(val)) {
				target[key] = deepCloneArray(val);
				return;

				// custom cloning and overwrite for specific objects
			} else if (isSpecificValue(val)) {
				target[key] = cloneSpecificValue(val);
				return;

				// overwrite by new value if source isn't object or array
			} else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
				target[key] = deepExtend({}, val);
				return;

				// source value and new value is objects both, extending...
			} else {
				target[key] = deepExtend(src, val);
				return;
			}
		});
	});

	return target;
}

// 3 times faster than JSON.parse(JSON.stringify(obj))
export function cloneObject(taget: any, src: any) {
	for (let i in src) {
		taget[i] = src[i] && typeof src[i] === 'object' ? cloneObject(src[i].constructor(), src[i]) : src[i];
	}
	return taget;
}

export const formatJSON = (function () {
	let pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g;
	return function (template: string, json: any) {
		return template.replace(pattern, function (match, key, value) {
			return json[key];
		});
	};
})();

export const Is = {
	Array: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object Array]';
	},
	RegExp: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object RegExp]';
	},
	Date: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object Date]';
	},
	Number: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object Number]';
	},
	String: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object String]';
	},
	Object: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object Object]';
	},
	HTMLDocument: function (obj: any): boolean {
		return Object.prototype.toString.call(obj) == '[object HTMLDocument]';
	},
	PlainObject: function (obj: any) {
		// Basic check for Type object that's not null
		if (typeof obj == 'object' && obj !== null) {
			// If Object.getPrototypeOf supported, use it
			if (typeof Object.getPrototypeOf == 'function') {
				let proto = Object.getPrototypeOf(obj);
				return proto === Object.prototype || proto === null;
			}

			// Otherwise, use internal class
			// This should be reliable as if getPrototypeOf not supported, is pre-ES5
			return Object.prototype.toString.call(obj) == '[object Object]';
		}

		// Not an object
		return false;
	},
};

export const jsonPath = function (src: object, path?: string): any {
	if (!path) {
		return src;
	} else {
		let arr = path.split('.');
		let props = `["${arr.join('"]["')}"]`;
		// return ev al(`(src${props})`);
		let f = new Function('src', `return src${props}`);
		return f(src);
	}
};

type StringMap = {
	[key: string]: string;
};

const htmlEncodeMap: StringMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;', // ' -> &apos; for XML only
};

export const htmlEncode = function (str: string): string {
	return str.replace(/[&<>"']/g, function (m: string): string {
		return htmlEncodeMap[m];
	});
};

const htmlDecodeMap: StringMap = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
};

export const htmlDecode = function (str: string): string {
	return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, function (m) {
		return htmlDecodeMap[m];
	});
};

//https://codepen.io/malyw/pen/azJGNw
const isSame = document.body.isEqualNode ? 'isEqualNode' : 'isSameNode';
export const delegate = function (
	wrapperEl: HTMLElement,
	eventName: string,
	delegatedElClass: string,
	action: Function
) {
	wrapperEl.addEventListener(eventName, function (event) {
		let clickedEl = event.target as HTMLElement;
		let checkingNode: HTMLElement | undefined = clickedEl;

		while (checkingNode) {
			if (checkingNode[isSame](wrapperEl)) {
				// checking element itself
				checkingNode = undefined; // STOP loop
			} else {
				if (checkingNode.classList.contains(delegatedElClass)) {
					// found delegated element
					action.call(checkingNode, event); // "this" will be delegated el
					checkingNode = undefined; // STOP loop
				} else {
					// going to parent node
					checkingNode = checkingNode.parentNode as HTMLElement;
				}
			}
		}
	});
};

export function delay(interval: number, num: number) {
	return new Promise((resolve) =>
		setTimeout(() => {
			// console.log('num=>' , num);
			resolve();
		}, interval)
	);
}
