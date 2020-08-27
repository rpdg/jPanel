const log = {
	active: function (b: boolean) {
		if (b) {
			let elChild: HTMLElement = document.getElementById('divScreenLog');

			if (!elChild) {
				elChild = document.createElement('div');
				elChild.id = 'divScreenLog';

				elChild.style.cssText += `position: absolute;
                z-index: 99999;
                top: 80px;
                right: 80px;
                opacity: 0.80;
                background: #000;
                color: #fff;
                font-size: 16px;`;

				document.body.appendChild(elChild);
			}

			window.console.log = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML += '<hr>';
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML += data[i] + '<hr>';
				}
			};

			window.console.warn = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML += '<hr>';
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML += `<span style="color:orange;font-size: 16px;">${data[i]}</span><hr>`;
				}
			};

			window.console.error = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML += '<hr>';
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML += `<span style="color:red;font-size: 16px;">${data[i]}</span><hr>`;
				}
			};
			
			window.console.clear = function () {
				elChild.innerHTML = '';
			};
		}
	},
};

export default log;
