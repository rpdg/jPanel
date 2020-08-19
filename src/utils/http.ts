export type xhrOptions = {
	method: 'POST' | 'GET' | 'PUT' | 'DELETE';
	url: string;
	params?: any;
	headers?: any;
};

export default function getJSON<T>(opts: xhrOptions) {
	return new Promise<T>(function (resolve, reject) {
		let xhr = new XMLHttpRequest();

		xhr.open(opts.method, opts.url);
		xhr.timeout = 3e4; // time in milliseconds

		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(JSON.parse(xhr.response) as T);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText,
				});
			}
		};

		xhr.ontimeout = function () {
			reject({ message: 'Timed out' });
		};

		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText,
			});
		};

		// Set headers
		if (opts.headers) {
			Object.keys(opts.headers).forEach(function (key) {
				xhr.setRequestHeader(key, opts.headers[key]);
			});
        }
        
		let params = opts.params;
		if (params && typeof params === 'object') {
			params = Object.keys(params)
				.map(function (key) {
					return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
				})
				.join('&');
        }
        

		xhr.send(params);
	});
}
