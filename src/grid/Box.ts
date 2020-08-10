import * as x$ from '../utils/domHelper';
import Grid from './Grid';

type GridMap = { [key: string]: number };

class Box {
	static boxes: Grid[] = [];
	static current: Grid = null;
	static previous: Grid = null;
	static currentIndex: number = -1;
	static previousIndex: number = -1;
	static enable: boolean = true;
	static eventName: string = 'keydown';
	static gridMap: GridMap = {};

	static addGrid(...grids: Grid[]) {
		for (let i = 0, l = grids.length; i < l; i++) {
			let grid = grids[i];
			if (grid.name) {
				Box.gridMap[grid.name] = Box.boxes.length;
			}
			grid.boxIndex = Box.boxes.length;
			Box.boxes.push(grid);
		}
	}
	static removeGrid(i: number) {
		if (Box.currentIndex === i) {
			Box.current = null;
			Box.currentIndex = -1;

			if (Box.previous) {
				Box.jumpTo(Box.previous);
				Box.previous = null;
				Box.previousIndex = -1;
			}
		}
		Box.boxes.splice(i, 1);
		return this;
	}

	static getGrid(i: number | string): Grid {
		if (typeof i === 'string') {
			i = Box.gridMap[i];
			if (i == undefined) return null;
		}
		return Box.boxes[i];
	}

	static jumpTo(i: number | string | Grid, j?: number) {
		if (i instanceof Grid) {
			i = i.boxIndex;
		} else if (typeof i === 'string') {
			i = Box.gridMap[i];
			if (i === undefined) i = Box.currentIndex;
		}
		if (i === -1) i = Box.previousIndex;
		let tar = Box.boxes[i as number];
		if (Box.current != tar) {
			if (tar.length) {
				if (Box.current) {
					Box.current.onBlur();
					Box.previous = Box.current;
					Box.previousIndex = Box.currentIndex;
				}
				Box.current = tar;
				Box.currentIndex = i;
				if (j != undefined) {
					Box.current.setIndex(j, 'sync');
				}
				tar.onFocus();
			}
		}
		if (j) {
			Box.current.setIndex(j, 'sync');
		}
	}

	static jumpBack() {
		Box.jumpTo(Box.previousIndex);
	}

	static keyHolder(evt: KeyboardEvent) {
		//evt.stopPropagation();
		if (Box.enable && Box.currentIndex != -1) {
			Box.current.keyHandler(evt);
		}
	}

	static active(evtName?: string) {
		if (Box.currentIndex === -1 && Box.boxes.length) {
			Box.jumpTo(0);
		}
		Box.eventName = evtName || Box.eventName;
		x$.on(Box.eventName, Box.keyHolder);
	}

	static inactive() {
		document.removeEventListener(Box.eventName, Box.keyHolder);
	}

	static reset(blurCurrent?: boolean, i?: number, j?: number) {
		if (blurCurrent && Box.current) Box.current.onBlur();
		Box.current = Box.previous = null;
		Box.currentIndex = Box.previousIndex = -1;

		if (i !== undefined) Box.jumpTo(i, j);
	}
}

export default Box;
