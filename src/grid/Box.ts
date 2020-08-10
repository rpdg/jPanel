import Grid from './Grid';

export default {
	boxes: [],
	current: null,
	currentIndex: -1,
	enable: true,
	eventName: 'keydown',
	gridMap: {},
	previous: null,
	previousIndex: -1,
	getGrid: function (i: number | string) {
		if (typeof i === 'string') {
			i = this.gridMap[i];
			if (i == undefined) return;
		}
		return this.boxes[i];
	},
	addGrid: function (...grids: Grid[]) {
		for (let i = 0, l = grids.length; i < l; i++) {
			let grid = grids[i];
			if (grid.name) {
				this.gridMap[grid.name] = this.boxes.length;
			}
			grid.boxIndex = this.boxes.length;
			this.boxes.push(grid);
		}
		return this;
	},
	removeGrid: function (i: number) {
		if (this.currentIndex === i) {
			this.current = null;
			this.currentIndex = -1;

			if (this.previous) {
				this.jumpTo(this.previous);
				this.previous = null;
				this.previousIndex = -1;
			}
		}
		this.boxes.splice(i, 1);
		return this;
	},
	jumpTo: function (i: number | string | Grid, j?: number) {
		if (i instanceof Grid) {
			i = i.boxIndex;
		} else if (typeof i === 'string') {
			i = this.gridMap[i];
			if (i === undefined) i = this.currentIndex;
		}
		if (i === -1) i = this.previousIndex;
		let tar = this.boxes[i as number];
		if (this.current != tar) {
			if (tar.length) {
				if (this.current) {
					this.current.blur();
					this.previous = this.current;
					this.previousIndex = this.currentIndex;
				}
				this.current = tar;
				this.currentIndex = i;
				if (j != undefined) this.current.setIndex(j, 'sync');
				this.current.focus();
			}
		}
		if (j) this.current.setIndex(j, 'sync');
		return this;
	},
	jumpBack: function () {
		return this.jumpTo(this.previousIndex);
	},
	keyHolder: function (evt: KeyboardEvent) {
		//evt.stopPropagation();
		const xb = this;
		if (xb.enable && xb.currentIndex != -1) xb.current.keyHandler(evt);
	},
	active: function (evtName?: string) {
		if (this.currentIndex === -1 && this.boxes.length) {
			this.jumpTo(0);
		}
		this.eventName = evtName || this.eventName;
		// @ts-ignore
		x$.on(this.eventName, this.keyHolder);
		return this;
	},
	inactive: function () {
		document.removeEventListener(this.eventName, this.keyHolder);
		return this;
	},
	reset: function (blurCurrent?: boolean, i?: number, j?: number) {
		if (blurCurrent && this.current) this.current.blur();
		this.current = this.previous = null;
		this.currentIndex = this.previousIndex = -1;

		if (i !== undefined) this.jumpTo(i, j);
	},
};
