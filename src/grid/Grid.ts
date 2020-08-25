import { KeyMap, KEY_CODE_MAPS, KEY_NAMES } from '../utils/consts';
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

type EdgeHandler = (this: Grid, direct: Direction) => void;

type EdgeRule = {
	[direct: string]: EdgeHandler | EdgeStaticRule;
	left?: EdgeHandler | EdgeStaticRule;
	right?: EdgeHandler | EdgeStaticRule;
	up?: EdgeHandler | EdgeStaticRule;
	down?: EdgeHandler | EdgeStaticRule;
};

type GridEventHandler = (this: Grid, data?: any) => void;

type Point = {
	x?: number;
	y?: number;
};

type Recagle = Point & {
	w?: number;
	h?: number;
};

export type GridOption = {
	edgeRule?: EdgeRule;
	forceRec?: boolean | Point[] | 'strict' | Recagle;
	frameId?: string;
	cols?: number;
	rows?: number;
	hoverClass?: string;
	keyMap?: KeyMap;
	name?: string;
	offset?: Point;
	onBlur?: GridEventHandler;
	onBeforeChange?: GridEventHandler;
	onChange?: GridEventHandler;
	onFocus?: GridEventHandler;
	onHover?: GridEventHandler;
	onOk?: GridEventHandler;
	selectedIndex?: number;
};

const defaultOptions: GridOption = {
	edgeRule: {
		up: 'stop',
		down: 'stop',
		left: 'stop',
		right: 'stop',
	},
	forceRec: false,
	keyMap: KEY_CODE_MAPS,
	offset: {
		x: 0,
		y: 0,
	},
};

export default class Grid {
	boxIndex = -1;
	edgeRule: EdgeRule;
	forceRec: boolean | 'strict' | Recagle;
	frame?: HTMLElement;
	cols?: number;
	rows?: number;
	items: HTMLElement[];
	keyMap: KeyMap;
	matrix: Point[];
	name: string;
	offset: Point;
	onBeforeChange?: GridEventHandler;
	onBlur?: GridEventHandler;
	onChange?: GridEventHandler;
	onFocus?: GridEventHandler;
	onHover?: GridEventHandler;
	onNoData?: GridEventHandler;
	onOk?: GridEventHandler;
	previousIndex = -1;
	selectedIndex: number;
	selector: string;
	private hoverTimer = 0;
	private hoverDelay = 1e3;
	private hoverClass?: string;

	[key: string]: any;

	constructor(selector: string, option: GridOption) {
		this.selector = selector;

		let sets = deepExtend<GridOption>({}, defaultOptions, option);

		this.name = option.name ?? `grid-${componentUid()}`;

		this.edgeRule = sets.edgeRule;
		this.keyMap = sets.keyMap;
		this.cols = sets.cols ?? 1;
		this.rows = sets.rows ?? 1;
		this.selectedIndex = sets.selectedIndex ?? 0;
		this.offset = sets.offset;
		this.onFocus = sets.onFocus && sets.onFocus.bind(this);
		this.onOk = sets.onOk && sets.onOk.bind(this);
		this.onBlur = sets.onBlur && sets.onBlur.bind(this);
		this.onBeforeChange = sets.onBeforeChange && sets.onBeforeChange.bind(this);
		this.onChange = sets.onChange && sets.onChange.bind(this);
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
			this.forceRec = option.forceRec ?? false;
			this.initMatrix();
		}

		if (this.length) {
			this.setIndex(this.selectedIndex, DIRECTIONS.AUTO);
		}
	}

	focus() {
		if (this.frame) {
			this.frame.style.display = 'block';
		}
		if (this.hoverClass) {
			addClass(this.selectedElement, this.hoverClass);
		}

		if (this.onFocus) {
			this.onFocus.call(this);
		}
	}

	blur() {
		if (this.frame) {
			this.frame.style.display = 'none';
		}
		if (this.hoverClass) {
			removeClass(this.selectedElement, this.hoverClass);
		}

		if (this.onBlur) {
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
			this.onBeforeChange.call(this, direc);
		}

		if (t < 0 || t + 1 > this.length) {
			this.overRange(direc);
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

				if ((this.rows > 1 && direc) || direc === 'auto') {
					frame.style.cssText += ';top:' + mx.y + 'px;';
				}
				if ((this.cols > 1 && direc) || direc === 'auto') {
					frame.style.cssText += ';left:' + mx.x + 'px;';
				}
			}

			if (this.onChange) {
				this.onChange(direc);
			}

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
						this.onOk.call(this);
					}
				} else {
					//press arrow key
					const cols = this.cols;
					const rows = this.rows;

					if (
						(keyName === KEY_NAMES.left && this.selectedIndex % cols === 0) ||
						(keyName === KEY_NAMES.right && (this.selectedIndex + 1) % cols === 0) ||
						(keyName === KEY_NAMES.up && this.selectedIndex < cols) ||
						(keyName === KEY_NAMES.down &&
							this.selectedIndex + cols + 1 > Math.min(rows * cols, this.length))
					) {
						this.overRange(keyName as Direction);
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

	extra(extras: any) {
		for (let key in extras) {
			if (this[key] === undefined) {
				this[key] = extras[key];
			}
		}
		return this;
	}

	private overRange(w: Direction) {
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
					(this.edgeRule[w] as EdgeHandler).call(this, w);
				}
				break;
			case DIRECTIONS.DOWN:
			case DIRECTIONS.RIGHT:
				if (this.edgeRule[w] === EDGE_RULES.LOOP) {
					var i = this.selectedIndex + 1;
					this.setIndex(i > this.length - 1 ? 0 : i, w);
				} else {
					(this.edgeRule[w] as EdgeHandler).call(this, w);
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
			if (fc === 'strict') {
				if (this.length) {
					let recagle = this.items[0].getBoundingClientRect();
					rec = {
						x: recagle.left + this.offset.x,
						y: recagle.top + this.offset.y,
						w: recagle.width,
						h: recagle.height,
					};
				} else {
					rec = { x: 0, y: 0, w: 0, h: 0 };
				}
			} else {
				rec = fc;
			}

			let c = this.cols,
				r = this.rows;

			for (let i = 0, t = c * r; i < t; i++) {
				let x = (i % c) * rec.w + rec.x;
				let y = ((i / c) | 0) * rec.h + rec.y;
				this.matrix[i] = { x, y };
			}

			this.forceRec = false;
		}
	}

	set elems(list: HTMLElement[]) {
		this.items = list;
		// this.length = list.length;
		if (list.length === 0) {
			if (this.frame) {
				this.frame.style.visibility = 'hidden';
			}
			if (this.onNoData) {
				this.onNoData.call(this);
			}
		}
		// TODO: need check before use, maybe not supported
		else if (this.frame && window.getComputedStyle(this.frame, null).visibility === 'hidden') {
			this.frame.style.visibility = 'visible';
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
