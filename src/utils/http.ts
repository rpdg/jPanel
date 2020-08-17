export type xhrOptions = {
	method: 'POST' | 'post' | 'GET' | 'get';
	url: string;
	params?: any;
	headers?: any;
};

export function query<T>(opts: xhrOptions) {
	return new Promise<T>(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open(opts.method, opts.url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response as T);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText,
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText,
			});
		};
		if (opts.headers) {
			Object.keys(opts.headers).forEach(function (key) {
				xhr.setRequestHeader(key, opts.headers[key]);
			});
		}
		let params = opts.params;
		// We'll need to stringify if we've been given an object
		// If we have a string, this is skipped.
		if (params && typeof params === 'object') {
			params = Object.keys(params)
				.map(function (key) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
				})
				.join('&');
		}
		xhr.send(params);
	});
}
