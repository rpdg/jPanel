import { componentUid, htmlEncode, Is } from './helper';

export interface ItemRenderEntry {
	(val: string, index?: number, row?: any, srcName?: string): string;
}

export interface ItemRender {
	[renderName: string]: ItemRenderEntry;
}
export interface ItemFilter {
	(row: any, index: number): any;
}

export interface BindListOption {
	list?: any[];
	template?: string;
	mode?: string;
	storeData?: boolean;
	itemRender?: ItemRender;
	itemFilter?: ItemFilter;
	nullShown?: string;
	joiner?: string;
	onBound?: (list: Array<any>, sets: BindListOption) => void;
}

type BindCache = {
	template: string;
	__render__: Function;
	mode: string;
	itemRender?: ItemRender;
	itemFilter?: ItemFilter;
	joiner: string;
	onBound?: (list: Array<any>, sets: BindListOption) => void;
};

interface IBoundHash {
	[renderName: string]: BindCache;
}

function xss(obj: any): any {
	for (let key in obj) {
		let vva = obj[key];
		if (Is.String(vva)) {
			obj[key] = htmlEncode(vva);
		} else if (Is.PlainObject(vva)) {
			xss(vva);
		}
	}
	return obj;
}

function makeCache(cacheId: string, sets: BindListOption): BindCache {
	let template = sets.template || '';
	const nullShown = sets.nullShown || '';
	const rnderFns = template.match(/\${[\w|.]+(:=)+\w+}/g);

	let renderEvalStr = 'row[":index"]=i; ';
	let cleanEvalStr = "delete row[':index']; delete row[':rowNum']; ";

	if (rnderFns) {
		for (let fs = 0; fs < rnderFns.length; fs++) {
			let _attr = rnderFns[fs].substr(2, rnderFns[fs].length - 3);
			let _ndex = _attr.indexOf(':=');
			let keyName = _attr.substr(0, _ndex);
			let pathName = keyName.split('.').join("']['");
			let _renderName = _attr.substr(_ndex + 2);
			let attrRender = pathName + ':=' + _renderName;
			renderEvalStr +=
				"row['" +
				attrRender +
				"']=scope['" +
				_renderName +
				"'](row['" +
				pathName +
				"'] , i , row ,'" +
				keyName +
				"') ;";

			cleanEvalStr += "delete row['" + attrRender + "']; ";
		}
	}

	const pattern = /\${([\w|.]*[:]*[=]*\w+)\}(?!})/g;
	const str = template.replace(pattern, function (match, key, i) {
		let pathName = key.split('.').join("']['");
		let scriptStr =
			"'+( row['" +
			pathName +
			"']===null||row['" +
			pathName +
			"']===undefined ?'" +
			nullShown +
			"': row['" +
			pathName +
			"'])+'";
		return scriptStr;
	});

	renderEvalStr += "var out='" + str + "'; " + cleanEvalStr + 'return out;';

	let cache: BindCache = {
		template: template,
		__render__: new Function('row', 'i', 'scope', renderEvalStr),
		mode: sets.mode || '',
		itemRender: sets.itemRender,
		itemFilter: sets.itemFilter,
		joiner: sets.joiner || '',
		onBound: sets.onBound,
	};

	boundHash[cacheId] = cache;

	return cache;
}

function removeCache(id: string) {
	delete boundHash[id];
}

// the setting cache for bindUrl and bindList use
const boundHash: IBoundHash = {};

// bindList :
// 转义用： {{property}}
// 模板特定内置值  : {:index} 代入当前的nodeIndex，不受filter影响;  {:rowNum} 当前的行序号（此指受filter影响, 运行时产生，未必等于{:index}+1）
// sets.itemRender : 在每个function可依次传入3个参数： 属性值/当前索引值/当前整个listNode[i]的obj对象，必须返回string
// sets.itemFilter ：可在每行操作前，先对该 Node 对象做一些预先加工操作, 可接收2个参数 node/index ， 返回node
//                   也可以用这个对nodeList进行过滤，将满足过滤条件的node，返回false即可，
//                   后续的node 的{:index}不受过滤影响
// sets.mode     : append / prepend /after / before / and anyOther or undefined (default) is use html-replace
// sets.onBound  : [event]
// sets.joiner : 各个结果的连接字符，默认空
// set.nullShown : 将值为null的属性作何种显示，默认显示为empty string
export default function bindList(elem: HTMLElement, sets: BindListOption | object[]) {
	let cacheId =
		elem.id ||
		(function () {
			elem.id = 'ui_' + componentUid();
			return elem.id;
		})();

	let cache: BindCache;

	let template: string | undefined,
		list: object[],
		itemRender: ItemRender | undefined,
		itemFilter: ItemFilter | undefined,
		mode: string;

	/*
		当先前已经设定过template的时候，
		可以只传入一个JSON list作参数以精简代码，
		而且render/filter/mode/event 均依照最近一次设定
	*/
	if (Is.Array(sets)) {
		if (!boundHash[cacheId]) {
			throw new Error('bind list cache not init yet');
		}

		cache = boundHash[cacheId];

		list = sets as object[];

		itemRender = cache.itemRender;
		itemFilter = cache.itemFilter;
		mode = cache.mode;
	} else {
		let _sets = sets as BindListOption;
		template = _sets.template;

		if (boundHash[cacheId] && boundHash[cacheId].template === template) {
			cache = boundHash[cacheId];
		} else {
			cache = makeCache(cacheId, _sets);
		}

		list = _sets.list || [];

		itemRender = cache.itemRender;
		itemFilter = cache.itemFilter;
		mode = cache.mode;
	}

	let scope = itemRender || window,
		htmlStrs = [],
		nb = 0,
		rowObject,
		useFilter = typeof itemFilter === 'function';

	for (let i = 0, l = list.length; i < l; i++) {
		rowObject = list[i];

		//过滤data
		if (useFilter) {
			rowObject = (<ItemFilter>itemFilter)(rowObject, i);
		}

		//如果data没有被itemFilter过滤掉
		if (rowObject) {
			// protect xss
			xss(rowObject);
			//行号
			rowObject[':rowNum'] = ++nb;
			//renderer
			htmlStrs[i] = cache['__render__'](rowObject, i, scope);
		}
	}

	elem.innerHTML = htmlStrs.join(cache.joiner);

	if (typeof cache.onBound === 'function') {
		cache.onBound.call(elem, list, sets);
	}
}
