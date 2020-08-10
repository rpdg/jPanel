import { EMPTY_FUNC, KeyMap, KEY_CODE_MAPS, KEY_NAMES } from '../utils/consts';
import { addClass, removeClass } from '../utils/domHelper';
import $select from '../utils/selector';

const EDGE_RULES = {
	STOP: 'stop',
	LOOP: 'loop',
};

type Direction = 'up' | 'down' | 'left' | 'right' | 'auto' | 'sync';

const DIRECTIONS: {
	[key: string]: Direction;
} = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
	AUTO: 'auto',
	SYNC: 'sync',
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
	hoverClass?: string;
	keyMap?: KeyMap;
	name: string;
	offset?: Coordinate;
	onBlur?: GridEventHandler;
	onChange?: GridEventHandler;
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
	keyMap: KEY_CODE_MAPS,
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
	name?: string;
	offset: Coordinate;
	onBeforeChange?: GridEventHandler;
	onBlur: GridEventHandler;
	onChange?: GridEventHandler;
	onFocus: GridEventHandler;
	onHover?: GridEventHandler;
	onNoData?: GridEventHandler;
	onOk?: GridEventHandler;
	previousIndex = -1;
	selectedIndex = 0;
	selector: string;
	private hoverTimer = 0;
	private hoverDelay = 1e3;
	private hoverClass?: string;

	constructor(selector: string, option: GridOption) {
		let sets = Object.assign({}, defaultOptions, option);
		this.selector = selector;
		this.name = sets.name;
		this.edgeRule = sets.edgeRule;
		this.keyMap = sets.keyMap;
		this.grid = sets.grid;
		this.offset = sets.offset;
		this.onFocus = sets.onFocus;
		this.onOk = sets.onOk;
		this.onBlur = sets.onBlur;
		this.onChange = sets.onChange;
		this.hoverClass = sets.hoverClass;

		if (sets.frameId) {
			this.frame = document.getElementById(sets.frameId);
		}

		this.elems = $select(selector);

		if (option.forceRec instanceof Array) {
			this.matrix = option.forceRec;
			this.forceRec = false;
		} else {
			this.matrix = [];
			this.forceRec = option.forceRec || false;
			this.initMatrix();
		}
	}

	reset(i: number, direc?: Direction) {
		this.elems = $select(this.selector);
		this.previousIndex = this.selectedIndex = -1;
		if (!isNaN(i) && this.length) {
			this.setIndex(i, direc || DIRECTIONS.AUTO);
		}
	}

	setIndex(t: number, direc?: Direction) {
		if (this.onBeforeChange) {
			this.onBeforeChange(direc);
		}
		if (t < 0 || t + 1 > this.length) {
			this.onOverRange(direc);
		} else {
			if (this.hoverTimer) {
				clearTimeout(this.hoverTimer);
				this.hoverTimer = 0;
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
				if ((this.grid.cols > 1 && direc) || direc === 'auto') {
					frame.style.cssText += ';left:' + mx.x + 'px;';
				}
			}
			if (this.onChange) this.onChange(direc);

			if (this.onHover && direc) {
				this.hoverTimer = window.setTimeout(() => {
					this.onHover(direc);
				}, this.hoverDelay);
			}
			//switch hover class
			if (this.hoverClass && direc != DIRECTIONS.AUTO) {
				let prevElem = this.previousElement;
				if (prevElem) {
					removeClass(prevElem, this.hoverClass);
				}

				addClass(this.selectedElement, this.hoverClass);
			}
		}
	}

	// TODO: not imp
	addToBox(asName: string) {
		// if (asName) {
		// 	this.name = asName;
		// }
		// Box.addGrid(this);
		// return this;
	}

	// TODO: not imp
	jumpToBox(i: number, j: number) {
		// if (i === -1) {
		// 	Box.jumpBack();
		// } else {
		// 	Box.jumpTo(i, j);
		// }
	}

	keyHandler(evt: KeyboardEvent) {
		if (this.length !== 0) {
			const keyCode = evt.keyCode || evt.which;
			const keyName = this.keyMap[keyCode];

			if (keyName && keyName in KEY_NAMES) {
				if (keyName === KEY_NAMES.ok) {
					if (this.onOk) {
						this.onOk();
					}
				} else {
					//press arrow key
					const cols = this.grid.cols;
					const rows = this.grid.rows;

					if (
						(keyName === KEY_NAMES.left && this.selectedIndex % cols === 0) ||
						(keyName === KEY_NAMES.right && (this.selectedIndex + 1) % cols === 0) ||
						(keyName === KEY_NAMES.up && this.selectedIndex < cols) ||
						(keyName === KEY_NAMES.down &&
							this.selectedIndex + cols + 1 > Math.min(rows * cols, this.length))
					) {
						this.onOverRange(keyName as Direction);
					} else {
						let n =
							keyName === KEY_NAMES.left
								? -1
								: keyName === KEY_NAMES.right
								? 1
								: keyName === KEY_NAMES.up
								? -cols
								: cols;
						this.setIndex(this.selectedIndex + n, keyName as Direction);
					}
				}
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
		else if (this.frame && window.getComputedStyle(this.frame, null).visibility === 'hidden') {
			this.frame.style.cssText += ';visibility:visible;';
		}
	}

	get length(): number {
		return this.items.length;
	}

	get selectedElement(): HTMLElement {
		return this.items[this.selectedIndex];
	}

	get previousElement(): HTMLElement {
		return this.items[this.previousIndex];
	}
}
