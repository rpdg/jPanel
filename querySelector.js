//new on 2014-03-19

var x$ = function (selector, context) {
	// Handle x$(""), x$(null), or x$(undefined)
	if (!selector) {
		return [];
	}

	// Handle x$(DOMElement)
	if (selector.nodeType) {
		return [selector] ;
	}

	else
	return Array.prototype.slice.call((context || document).querySelectorAll(selector));
};

