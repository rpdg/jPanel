import { EMPTY_FUNC, KeyMap, KEY_MAPS } from '../utils/consts';
import $select from '../utils/selector';

const EDGE_RULES = {
	STOP: 'stop',
	LOOP: 'loop',
};

type Direction = 'up' | 'down' | 'left' | 'right' | 'auto';

const DIRECTIONS = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
	AUTO: 'auto',
};

type EdgeStaticRule = 'stop' | 'loop';
type EdgeHandler = (direct: Direction) => void;
type EdgeRule = {
	[direct: string]: EdgeHandler | EdgeStaticRule;
	left?: EdgeHandler | EdgeStaticRule;
	right?: EdgeHandler | EdgeStaticRule;
	up?: EdgeHandler | EdgeStaticRule;
	down?: EdgeHandler | EdgeStaticRule;
};
type GridEventHandler = (data?: any) => void;

type GridTable = {
	cols?: number;
	rows?: number;
};

type Coordinate = {
	x?: number;
	y?: number;
};

type Recagle = {
	w?: number;
	h?: number;
} & Coordinate;

type GridOption = {
	edgeRule?: EdgeRule;
	forceRec?: boolean | Coordinate[] | 'strict' | Recagle;
	frameId?: string;
	grid?: GridTable;
	keyMap?: KeyMap;
	name: string;
	offset?: Coordinate;
	onBlur?: GridEventHandler;
	onFocus?: GridEventHandler;
	onHover?: GridEventHandler;
	onOk?: GridEventHandler;
};

const defaultOptions: GridOption = {
	name: '',
	edgeRule: {
		up: 'stop',
		down: 'stop',
		left: 'stop',
		right: 'stop',
	},
	forceRec: false,
	keyMap: KEY_MAPS,
	grid: { cols: 1, rows: 1 },
	onFocus: EMPTY_FUNC,
	onBlur: EMPTY_FUNC,
};

export default class Grid {
	boxIndex = -1;
	edgeRule: EdgeRule;
	forceRec: boolean | 'strict' | Recagle;
	frame?: HTMLElement;
	grid: GridTable;
	items: HTMLElement[];
	keyMap: KeyMap;
	// length = 0;
	matrix: Coordinate[];
	name: string;
	offset: Coordinate;
	onBeforeChange?: GridEventHandler;
	onBlur?: GridEventHandler;
	onFocus?: GridEventHandler;
	onHover?: GridEventHandler;
	onNoData?: GridEventHandler;
	onOk?: GridEventHandler;
	previousIndex = -1;
	selectedIndex = 0;
	timer = 0;

	constructor(select: string, option: GridOption) {
		let sets = Object.assign({}, defaultOptions, option);
		this.name = sets.name;
		this.edgeRule = sets.edgeRule;
		this.keyMap = sets.keyMap;
		this.grid = sets.grid;
		this.offset = sets.offset;
		this.onFocus = sets.onFocus;
		this.onBlur = sets.onBlur;
		if (sets.frameId) {
			this.frame = document.getElementById(sets.frameId);
		}

		this.elems = $select(select);

		if (option.forceRec instanceof Array) {
			this.matrix = option.forceRec;
			this.forceRec = false;
		} else {
			this.matrix = [];
			this.forceRec = option.forceRec || false;
			this.initMatrix();
		}
	}

	setIndex(t: number, direc?: Direction) {
		if (this.onBeforeChange) {
			this.onBeforeChange(direc);
		}
		if (t < 0 || t + 1 > this.length) {
			this.onOverRange(direc);
		} else {
			if (this.timer) {
				clearTimeout(this.timer);
			}
			this.previousIndex = this.selectedIndex;
			this.selectedIndex = t;
			let frame = this.frame;
			let mx: Coordinate;
			if (frame) {
				if (!this.matrix[t] || this.forceRec === true) {
					// TODO: maybe not supported
					let point = this.items[t].getBoundingClientRect();
					this.matrix[t] = {
						x: point.left + this.offset.x,
						y: point.top + this.offset.y,
					};
				}
				mx = this.matrix[t];

				if ((this.grid.rows > 1 && direc) || direc === 'auto') {
					frame.style.cssText += ';top:' + mx.y + 'px;';
				}
				if ((this.grid.cols > 1 && direc) || direc === 'auto'){
					frame.style.cssText += ';left:' + mx.x + 'px;';
				}
			}

			if (this.onHover && direc){
				// TODO: to be continued
			}
		}
	}

	private onOverRange(w: Direction) {
		if (this.edgeRule[w] === 'stop') {
			return;
		}

		switch (w) {
			case 'up':
			case 'left':
				if (this.edgeRule[w] === 'loop') {
					let i = this.selectedIndex - 1;
					this.setIndex(i < 0 ? this.length - 1 : i, w);
				} else {
					(this.edgeRule[w] as EdgeHandler)(w);
				}
				break;
			case 'down':
			case 'right':
				if (this.edgeRule[w] === 'loop') {
					var i = this.selectedIndex + 1;
					this.setIndex(i > this.length - 1 ? 0 : i, w);
				} else {
					(this.edgeRule[w] as EdgeHandler)(w);
				}
				break;
			default:
			// do nothing.
		}
	}
	private initMatrix() {
		let rec: Recagle;
		let fc = this.forceRec;

		if (typeof fc !== 'boolean' && fc) {
			// init rec automaticly
			if (fc === 'strict' && this.length) {
				let recagle = this.items[0].getBoundingClientRect();
				rec = {
					x: recagle.left + this.offset.x,
					y: recagle.top + this.offset.y,
					w: recagle.width,
					h: recagle.height,
				};
			}

			let x: number,
				y: number,
				g = this.grid;

			for (let i = 0, t = g.cols * g.rows; i < t; i++) {
				x = (i % g.cols) * rec.w + rec.x;
				y = ((i / g.cols) | 0) * rec.h + rec.y;
				this.matrix[i] = { x: x, y: y };
			}

			this.forceRec = false;
		}
	}

	set elems(list: HTMLElement[]) {
		this.items = list;
		// this.length = list.length;
		if (this.length === 0) {
			if (this.frame) this.frame.style.cssText += ';visibility:hidden;';
			if (this.onNoData) this.onNoData();
		}
		// TODO: maybe not supported
		else if (
			this.frame &&
			window.getComputedStyle(this.frame, null).visibility === 'hidden'
		) {
			this.frame.style.cssText += ';visibility:visible;';
		}
	}

	get length(): number {
		return this.items.length;
	}
}
