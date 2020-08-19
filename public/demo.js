﻿let overCount = 0;
let menuBar = x$.dom.byId('menu');
let fullIemList = x$.dom.select('#menu>li');
let menu = new x$.Grid('#menu>.show', {
	name: 'menu',
	grid: { cols: 6 },
	forceRec: 'strict',
	hoverClass: 'hover',
	edgeRule: {
		right: function () {
			if (menu.selectedIndex + overCount + 1 < fullIemList.length) {
				overCount++;

				menu.items[0].className = '';
				menu.items[5].className = 'show';

				menuBar.style.marginLeft = -overCount * 185 + 'px';
				fullIemList[menu.selectedIndex + overCount].className = 'show';

				menu.reset(5, 'right');
			} else {
				overCount = 0;

				menu.items[5].className = '';
				menu.items[4].className = '';
				menu.items[3].className = '';
				menu.items[2].className = '';
				menu.items[1].className = '';
				menu.items[0].className = '';

				fullIemList[0].className = 'show';
				fullIemList[1].className = 'show';
				fullIemList[2].className = 'show';
				fullIemList[3].className = 'show';
				fullIemList[4].className = 'show';
				fullIemList[5].className = 'show';

				menu.reset(0, 'left');
				menuBar.style.marginLeft = '0px';
			}
		},
		left: function () {
			if (menu.selectedIndex + overCount - 1 > -1) {
				overCount--;

				menu.items[0].className = 'show';
				menu.items[5].className = '';

				menuBar.style.marginLeft = -overCount * 185 + 'px';
				fullIemList[menu.selectedIndex + overCount].className = 'show';

				menu.reset(0, 'left');
			} else {
				let c = fullIemList.length;
				overCount = c - 6;

				menu.items[5].className = '';
				menu.items[4].className = '';
				menu.items[3].className = '';
				menu.items[2].className = '';
				menu.items[1].className = '';
				menu.items[0].className = '';

				fullIemList[c - 1].className = 'show';
				fullIemList[c - 2].className = 'show';
				fullIemList[c - 3].className = 'show';
				fullIemList[c - 4].className = 'show';
				fullIemList[c - 5].className = 'show';
				fullIemList[c - 6].className = 'show';

				menu.reset(5, 'right');
				menuBar.style.marginLeft = -overCount * 185 + 'px';
			}
		},
		up: function () {
			if (menu.selectedIndex > 4) {
				menu.jumpToBox(topBtns);
			}
			// else this.jumpToBox(topNumber);
		},
	},
});

//top btn
let topBtns = new x$.Grid('.navBtn', {
	name: 'topBtns',
	frameId: 'frame0',
	grid: { cols: 2 },
	edgeRule: {
		// left: function () {
		// 	topBtns.jumpToBox(topNumber);
		// },
		down: function () {
			topBtns.jumpToBox(menu);
		},
	},
	onOk: function () {
		// switch (this.selectedIndex) {
		// 	case 0: {
		// 		//go to category index page
		// 		location.assign(x$.on.homepage);
		// 		break;
		// 	}
		// 	case 1: {
		// 		//go to main home page
		// 		location.assign(x$.on.homepage);
		// 		break;
		// 	}
		// }
	},
});

x$.Box.addGrid(menu, topBtns);
x$.Box.active();
