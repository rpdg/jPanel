import { EMPTY_FUNC, KeyMap, KEY_CODE_MAPS, KEY_NAMES } from '../utils/consts';
import { addClass, byId, removeClass, select as x$select } from '../utils/dom';
import { componentUid, deepExtend } from '../utils/helper';
import Box from './Box';

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

type Point = {
	x?: number;
	y?: number;
};

type Recagle = {
	w?: number;
	h?: number;
} & Point;

export type GridOption = {
	edgeRule?: EdgeRule;
	forceRec?: boolean | Point[] | 'strict' | Recagle;
	frameId?: string;
	grid?: GridTable;
	hoverClass?: string;
	keyMap?: KeyMap;
	name: string;
	offset?: Point;
	onBlur?: GridEventHandler;
	onChange?: GridEventHandler;
	onFocus?: GridEventHandler;
	onHover?: GridEventHandler;
	onOk?: GridEventHandler;
	selectedIndex?: number;
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
	offset: {
		x: 0,
		y: 0,
	},
	onFocus: EMPTY_FUNC,
	onBlur: EMPTY_FUNC,
	selectedIndex: 0,
};

export default class Grid {
	boxIndex = -1;
	edgeRule: EdgeRule;
	forceRec: boolean | 'strict' | Recagle;
	frame?: HTMLElement;
	grid: GridTable;
	items: HTMLElement[];
	keyMap: KeyMap;
	matrix: Point[];
	name?: string;
	offset: Point;
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
		this.selector = selector;

		let sets = deepExtend<GridOption>({}, defaultOptions, option);

		this.name = option.name ?? `grid-${componentUid()}`;
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
			this.frame = byId(sets.frameId);
		}

		this.elems = x$select(selector);

		if (option.forceRec instanceof Array) {
			this.matrix = option.forceRec;
			this.forceRec = false;
		} else {
			this.matrix = [];
			this.forceRec = option.forceRec || false;
			this.initMatrix();
		}

		if (this.length) {
			this.setIndex(sets.selectedIndex, DIRECTIONS.AUTO);
		}
	}

	focus() {
		if (this.frame) {
			this.frame.style.cssText += ';display:block;';
		}
		if (this.hoverClass) {
			addClass(this.selectedElement, this.hoverClass);
		}

		if (this.onFocus !== EMPTY_FUNC) {
			this.onFocus.call(this);
		}
	}

	blur() {
		if (this.frame) {
			this.frame.style.cssText += ';display:none;';
		}
		if (this.hoverClass) {
			removeClass(this.selectedElement, this.hoverClass);
		}

		if (this.onBlur !== EMPTY_FUNC) {
			this.onBlur.call(this);
		}
	}

	reset(i: number, direc?: Direction) {
		this.elems = x$select(this.selector);
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
			let mx: Point;
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

	addIntoBox(asName: string) {
		if (asName) {
			this.name = asName;
		}
		Box.addGrid(this);
		return this;
	}

	jumpToBox(i: number | string | Grid, j?: number) {
		if (i === -1) {
			Box.jumpBack();
		} else {
			Box.jumpTo(i, j);
		}
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
		if (this.edgeRule[w] === EDGE_RULES.STOP) {
			return;
		}

		switch (w) {
			case DIRECTIONS.UP:
			case DIRECTIONS.LEFT:
				if (this.edgeRule[w] === EDGE_RULES.LOOP) {
					let i = this.selectedIndex - 1;
					this.setIndex(i < 0 ? this.length - 1 : i, w);
				} else {
					(this.edgeRule[w] as EdgeHandler)(w);
				}
				break;
			case DIRECTIONS.DOWN:
			case DIRECTIONS.RIGHT:
				if (this.edgeRule[w] === EDGE_RULES.LOOP) {
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
		// TODO: need check before use, maybe not supported
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
