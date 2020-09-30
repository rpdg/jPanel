function setLogElementContent(elChild :HTMLElement , color:string , ...data: any[]){

	if (elChild.scrollHeight > 720) {
		elChild.innerHTML = '';
	} 

	elChild.innerHTML =  `${elChild.innerHTML}
		<hr style=" border: none; border-top: 7px double white;"> 
		<span style="color: ${color};font-size: 16px;">
		${data.join(`</span><hr style="border: none; border-top: 2px dashed ${color};"><span style="color: ${color};font-size: 16px;">`)}
		</span>
	` ;
}


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
				if (elChild.clientHeight > 720) {
					elChild.innerHTML = '';
				} 
				// else {
				// 	elChild.innerHTML = `${elChild.innerHTML}<hr style=" border: none; border-top: 7px double white;">` ;
				// }
				// for (let i = 0, len = data.length; i < len; i++) {
				// 	data[i] += '<hr>' ;
				// }
				
				setLogElementContent(elChild , '#fff' , ...data);
			};

			window.console.warn = function (...data: any[]) {
				setLogElementContent(elChild , 'orange' , ...data);
				// if (elChild.clientHeight > 720) {
				// 	elChild.innerHTML = '';
				// }
				// elChild.innerHTML =  `${elChild.innerHTML}
				// 	<hr style=" border: none; border-top: 7px double white;"> 
				// 	<span style="color: orange;font-size: 16px;">
				// 	${data.join('</span><hr><span style="color:red;font-size: 16px;">')}
				// 	</span>
				// ` ;
			};

			window.console.error = function (...data: any[]) {
				setLogElementContent(elChild , 'red' , ...data);
			};
			
			window.console.clear = function () {
				elChild.innerHTML = '';
			};
		}
	},
};

export default log;
