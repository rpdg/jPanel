if (!JSON) {
	var JSON = {
		parse: function (str) {
			return eval("(" + str + ")");
		}
	};
}


//
x$.EMPTY_FN = function () {
};

//
x$.browser = window.navigator.userAgent;
x$.version = '0.21';

//
x$.byId = function (str) {
	return document.getElementById(str);
};
x$.byClass = function (clsName, context) {
	return (context || document).getElementsByClassName(clsName);
};
x$.byTag = function (clsName, context) {
	return (context || document).getElementsByTagName(clsName);
};
//

//
x$.extend = function () {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && !(typeof target === 'function')) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if (length === i) {
		target = this;
		--i;
	}

	for (; i < length; i++) {
		// Only deal with non-null/undefined values
		if ((options = arguments[ i ]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && ( Object.prototype.toString.call(copy) === "[object Object]" || (copyIsArray = (copy instanceof Array)) )) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && (src instanceof Array) ? src : [];

					} else {
						clone = src && (Object.prototype.toString.call(src) === "[object Object]") ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = x$.extend(deep, clone, copy);

					// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


//
var log = x$.EMPTY_FN;
x$.activeLog = function (active) {
	if (active) {
		document.write('<div id="divLog"></div>');
		var e = document.getElementById("divLog");
		window.log = function () {
			if (e.scrollHeight > 600) e.innerHTML = '';
			else e.innerHTML += "<p>";
			for (var i = 0 , len = arguments.length; i < len; i++) {
				e.innerHTML += arguments[i] + " ";
			}
		}
	}
	else window.log = x$.EMPTY_FN;
};


x$.hasClass = function (elem, className) {
	var classList = ' ' + elem.className + ' ';
	return classList.indexOf(' ' + className + ' ') > -1;
};

x$.addClass = function (elem, className) {
	var classList = ' ' + elem.className + ' ';
	if (classList.indexOf(' ' + className + ' ') === -1)
		elem.className += (classList ? ' ' : '') + className;
};

x$.removeClass = function (elem, className) {
	var classList = ' ' + elem.className + ' ' , ts = ' ' + className + ' ' , cur = classList.indexOf(ts);
	if (cur > -1) elem.className = classList.substr(1, cur) + classList.substring(cur + className.length + 2, classList.length - 1);
};

x$.toggleClass = function (elem, className) {
	return x$[x$.hasClass(elem, className) ? 'removeClass' : 'addClass'](elem, className);
};


x$.attr = function (elem, attr, value) {
	if (value !== undefined) {
		return elem.setAttribute(attr, value);
	}
	else {
		return elem.getAttribute(attr);
	}
};

x$.formatJSON = (function () {
	var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g;
	return function (template, json) {
		return template.replace(pattern, function (match, key, value) {
			return json[key];
		});
	}
})();

//
x$.request = (function () {
	var ret = {},
		a = window.location,
		seg = a.search.replace(/^\?/, '').split('&'),
		len = seg.length,
		i = 0,
		s;
	for (; i < len; i++) {
		if (!seg[i]) continue;
		s = seg[i].split('=');
		ret[s[0]] = s[1];
		/*try{
		 ret[s[0]] = decodeURI(s[1]);
		 }
		 catch (e) {
		 continue;
		 }*/
	}
	return ret;
})();


//
x$.getJSON = (function (jPanel) {

	var xhrPool = [] , ajaxTimeout = 0;

	jPanel.ajaxSetup = function (sets) {
		ajaxTimeout = sets.timeout;
	};

	jPanel.cancelAllAjax = function () {
		for (var i = 0, len = xhrPool.length; i < len; i++) {
			xhrPool[i].abort();
		}
	};

	jPanel.param = function (obj) {
		var arr = [];
		for (var key in obj) {
			arr[ arr.length ] = key + "=" + encodeURIComponent(obj[key]);
		}
		return arr.join("&").replace(/%20/g, "+").replace(/%25/g, "%");
	};


	return function (url, params, callback, errHandler) {

		//var that = this;
		var req , timer;

		for (var i = 0, len = xhrPool.length; i < len; i++) {
			if (xhrPool[i].readyState == 4 || xhrPool[i].readyState == 0) {
				req = xhrPool[i];
				break;
			}
		}

		if (!req) {
			req = new XMLHttpRequest();
			xhrPool.push(req);
		}

		req.handleResp = req.handleErr = null;

		if (typeof params === 'function') {
			req.handleResp = params;
			if (typeof callback === 'function') req.handleErr = callback;
		}
		else {
			req.handleResp = callback;
			if (typeof errHandler === 'function') req.handleErr = errHandler;
			url += (url.indexOf('?') === -1 ? '?' : '&') + jPanel.param(params);
		}

		req.open('GET', url, true);
		//log(url);

		//Set "X-Requested-With" header
		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');


		function hdl() {
			//log(req.readyState + ' : ' + req.status + ' : [' + req.responseText + ']');
			if (req.readyState == 4 && req.responseText) {
				if (ajaxTimeout && timer) {
					clearTimeout(timer);
					timer = null;
				}

				if (req.status === 0 || req.status == 200) {
					var obj;
					try {
						obj = JSON.parse(req.responseText);
					}
					catch (e) {
						if (req.handleErr) req.handleErr(e.message, req.responseText);
					}
					req.handleResp(obj, x$);
				}
				else {
					if (req.handleErr) req.handleErr('Server error: ' + req.status, req.responseText);
				}
			}
		}

		req.onreadystatechange = hdl;

		req.send();

		if (ajaxTimeout) {
			timer = setTimeout(function () {
				req.abort();
				timer = null;
				if (req.handleErr) req.handleErr('timeout', ajaxTimeout);
			}, ajaxTimeout);
		}

		return req;
	}

})(x$);

x$.off = function(seed){
	var b = false , ss = x$.on.seeds ;
	for(var i = 0 , l = ss.length ; i < l ; i++){
		if(ss[i]==seed){
			ss.splice(i , 1);
			delete x$.on.listeners[seed] ;
			b = true ;
			break ;
		}
	}
	return b;
} ;

x$.on = function (evn , fn , addToHead) {
	var seed ;
	if(addToHead) {
		seed = --x$.on.seedMin ;
		x$.on.seeds.unshift(seed) ;
	}
	else {
		seed = ++x$.on.seedMax ;
		x$.on.seeds.push(seed) ;
	}
	x$.on.listeners[seed] = fn;
	fn.seed = seed ;
	return seed ;
};

x$.once = function(evt , cb , addToHead){
	cb.isOnce = true ;
	return x$.on(evt , cb , addToHead) ;
} ;

x$.on.seeds = [] ;
x$.on.seedMin = 0;
x$.on.seedMax = -1;
x$.on.listeners = {};
x$.on.homepage = '';
//
document.onkeydown = function(evt){

	var ls = x$.on.listeners , ss = x$.on.seeds.slice() ;


	for(var i = 0 ,l= ss.length ; i<l; i++){
		var fn = ls[ss[i]] ;
		var v = fn.call(window, evt);
		if(fn.isOnce) {
			x$.off(fn.seed) ;
		}
		if(v===false) return v;
	}


	//主页
	if(evt.keyCode == 72 && x$.on.homepage){
		location.href = x$.on.homepage ;
		return false;
	}
	//后退
	if(evt.keyCode == 8){
		history.back();
		return false;
	}

};

/*
 x$.share = {
 data: function (name, value) {
 var top = window.top,
 cache = top['__CACHE'] || {};
 top['__CACHE'] = cache;

 return value === undefined ? cache[name] : (cache[name] = value) ;
 },
 remove: function (name) {
 var cache = window.top['__CACHE'];
 if (cache && cache[name]) delete cache[name];
 }
 };
 */

(function (x$) {
	// the setting cache for bindUrl and bindList use
	var boundCache = {
		m_Count: 0,
		make: function (sets) {
			//alert('boundCache.make.caller');

			var template = sets.template , cache = { name: template } ,
				nullShown = sets['null'] || '';
			pnter = /\w+[:=]+\w+/g ,
				rnderFns = template.match(pnter),
				renderEvalStr = 'row[":index"]=i;';

			if (rnderFns) {
				var _attr , _ndex;
				for (var fs = 0; fs < rnderFns.length; fs++) {
					_attr = rnderFns[fs];
					_ndex = _attr.indexOf(":=");
					renderEvalStr += "row['" + _attr + "']=scope['" + _attr.substr(_ndex + 2) + "'](row['" + _attr.substr(0, _ndex) + "'] , i , row) ;";
				}
			}

			var pattern = /\{(\w*[:]*[=]*\w+)\}(?!})/g ,
			//ods = template.match(pattern) ,
				str = template.replace(pattern, function (match, key, i) {
					return '\'+(row[\'' + key + '\']===null?\'' + nullShown + '\':row[\'' + key + '\'])+\'';
				});

			renderEvalStr += 'var out=\'' + str + '\';return out;';

			//console.warn(renderEvalStr);

			cache["render"] = new Function("row", "i", "scope", renderEvalStr);

			if (sets.itemRender) cache.itemRender = sets.itemRender;
			if (sets.itemFilter) cache.itemFilter = sets.itemFilter;
			if (sets.onBound) cache.onBound = sets.onBound;

			cache['joiner'] = sets.joiner || '';
			cache['null'] = nullShown;

			return cache;
		},
		newId: function () {
			return "_Object__bind_" + this.m_Count++;
		},
		remove: function (id) {
			delete this[id];
		}
	};


	// bindList :
	// 转义用： {{property}}
	// 模板特定内置值  : {:index} 代入当前的nodeIndex，不受filter影响;  {:rowNum} 当前的行序号（此指受filter影响, 运行时产生，未必等于{:index}+1）
	// sets.itemRender : 在每个function可依次传入3个参数： 属性值/当前索引值/当前整个listNode[i]的obj对象，必须返回string
	// sets.itemFilter ：可在每行操作前，先对该 Node 对象做一些预先加工操作, 可接收2个参数 node/index ， 返回node
	//                   也可以用这个对nodeList进行过滤，将满足过滤条件的node，返回false即可，
	//					 后续的node 的{:index}不受过滤影响
	// sets.onBound  : [event]
	// sets.joiner : 各个结果的连接字符，默认空
	// set['null'] : 将值为null的属性作何种显示，默认显示为empty string
	x$.bindList = function (elem, sets) {
		if (!elem.nodeType) {
			elem = x$(elem)[0]
		}
		var cacheId = elem.id || elem.uniqueID || (function () {
			elem.id = boundCache.newId();
			return elem.id;
		})();

		var cache = boundCache[cacheId] || {} ,
			template , list , itemRender , itemFilter , storeArray;

		if (sets instanceof Array) {
			// 当先前已经设定过template的时候，
			// 可以只传入一个JSON list作参数以精简代码，
			// 而且render/filter/mode/event 均依照最近一次设定
			list = sets;
			itemRender = cache.itemRender;
			itemFilter = cache.itemFilter;
			mode = cache.mode;
		}
		else {
			template = sets.template;

			if (template !== undefined && cache["name"] != template) {
				cache = boundCache.make(sets);
				boundCache[cacheId] = cache;
			}

			list = sets.list;
			itemRender = sets.itemRender || cache.itemRender;
			itemFilter = sets.itemFilter || cache.itemFilter;
		}

		var scope = itemRender || window ,
			html = [] , i = 0 , nb = 0 , rowObject ,
			useFilter = (typeof(itemFilter) === 'function');

		for (; rowObject = list[i];) {
			//过滤data
			if (useFilter) rowObject = itemFilter(rowObject, i);

			//如果data没有被itemFilter过滤掉
			if (rowObject) {
				//行号
				rowObject[":rowNum"] = ++nb;
				//renderer
				html[i] = cache["render"](rowObject, i, scope);
			}
			++i;
		}
		elem.innerHTML = html.join(cache["joiner"]);

		if (typeof(cache.onBound) === 'function') {
			cache.onBound.call(elem, list, sets);
		}

		return elem;
	};

	x$.bindLists = function (elems, sets) {
		var cache;

		if (sets.mode === "setCache") cache = sets.cache;
		else  cache = boundCache.make(sets);

		for (var i = 0, l = elems.length; i < l; i++) {
			var o = elems[i];
			var cacheId = o.id || o.uniqueID || (function () {
				o.id = boundCache.newId();
				return o.id;
			})();

			boundCache[cacheId] = cache;
		}

		var len = Math.min(l, sets.lists.length);
		for (var j = 0; j < len; j++) {
			sets.list = sets.lists[j];
			x$.bindList(elems[j], sets);
		}

		if (typeof(sets.onAllComplete) === 'function') {
			sets.onAllComplete(sets);
		}

		if (sets.mode === "getCache") return cache;

		return this;
	};

})(x$);



