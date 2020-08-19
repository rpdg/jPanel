export type xhrOptions = {
	method: 'POST' | 'GET' | 'PUT' | 'DELETE';
	url: string;
	params?: any;
	headers?: any;
};

export default function getJSON<T>(opts: xhrOptions) {
	return new Promise<T>(function (resolve, reject) {
		let xhr = new XMLHttpRequest();

		let url = opts.url;

		if (opts.method === 'GET') {
			let querys = opts.params;
			if (querys && typeof querys === 'object') {
				querys = Object.keys(querys)
					.map(function (key) {
						return `${encodeURIComponent(key)}=${encodeURIComponent(querys[key])}`;
					})
					.join('&');
			}

			url += `?${querys}`;
		}

		xhr.open(opts.method, url);
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

		xhr.setRequestHeader('Content-Type', 'application/json');

		// Set headers
		if (opts.headers) {
			Object.keys(opts.headers).forEach(function (key) {
				xhr.setRequestHeader(key, opts.headers[key]);
			});
		}

		const params = (opts.method != 'GET' && opts.params) ? JSON.stringify(opts.params) : null;

		xhr.send(params);
	});
}
