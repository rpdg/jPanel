﻿const log = {
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

				window.console.clear = function () {
					elChild.innerHTML = '';
				};
			}
		}
	},
};

export default log;
