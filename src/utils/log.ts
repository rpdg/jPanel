const log = {
	active: function (b: boolean) {
		if (b) {
			let elChild: HTMLElement = document.getElementById('divScreenLog');

			if (!elChild) {
				elChild = document.createElement('div');
				elChild.id = 'divScreenLog';

				elChild.style.cssText += `position: fixed;
                z-index: 99999;
                top: 0;
				right: 0;
				max-height: 720px;
				overflow: scroll;
                background: rgba(0,0,0,0.5);
                color: #fff;
                font-size: 16px;`;

				document.body.appendChild(elChild);
			}

			window.console.log = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML = '<hr>' + elChild.innerHTML;
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML = data[i] + '<hr>' + elChild.innerHTML;
				}
			};

			window.console.warn = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML = '<hr>' + elChild.innerHTML;
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML = `<span style="color:orange;font-size: 16px;">${data[i]}</span><hr>` + elChild.innerHTML;;
				}
			};

			window.console.error = function (...data: any[]) {
				if (elChild.scrollHeight > 600) {
					elChild.innerHTML = '';
				} else {
					elChild.innerHTML = '<hr>' + elChild.innerHTML;
				}
				for (var i = 0, len = data.length; i < len; i++) {
					elChild.innerHTML = `<span style="color:red;font-size: 16px;">${data[i]}</span><hr>` + elChild.innerHTML;;
				}
			};
			
			window.console.clear = function () {
				elChild.innerHTML = '';
			};
		}
	},
};

export default log;
