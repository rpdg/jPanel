import { KeyMap, KEY_MAPS } from '../utils/consts';
import $select from '../utils/selector';

const EDGE_RULES = {
	STOP: 'stop',
	LOOP: 'loop',
};

type EdgeStaticRule = 'stop' | 'loop';
type EdgeHandler = () => void;
type EdgeRule = {
	left?: EdgeHandler | EdgeStaticRule;
	right?: EdgeHandler | EdgeStaticRule;
	up?: EdgeHandler | EdgeStaticRule;
	down?: EdgeHandler | EdgeStaticRule;
};
type GridEventHandler = () => void;

type GridTable = {
	cols?: number;
	rows?: number;
};

type Offset = {
	x?: number;
	y?: number;
};

type GridOption = {
	name: string;
	edgeRule?: EdgeRule;
	grid?: GridTable;
	offset?: Offset;
	keyMap?: KeyMap;
	onOk?: GridEventHandler;
	onFocus?: GridEventHandler;
	onBlur?: GridEventHandler;
	onHover?: GridEventHandler;
	frameId?: string;
};

const defaultOptions: GridOption = {
	name: '',
	edgeRule: {
		up: 'stop',
		down: 'stop',
		left: 'stop',
		right: 'stop',
	},
	keyMap: KEY_MAPS,
	grid: { cols: 1, rows: 1 },
	onFocus: function () {},
	onBlur: function () {},
};

export default class Grid {
	name: string;
	edgeRule: EdgeRule;
	offset: Offset;
	keyMap: KeyMap;
	grid: GridTable;
	frame?: HTMLElement;
	items: HTMLElement[];
	length = 0;
	onFocus: GridEventHandler;
	onBlur: GridEventHandler;
	onOk: GridEventHandler;
	onHover: GridEventHandler;
	onNoData: GridEventHandler;
	selectedIndex = 0;
	previousIndex = -1;
	boxIndex = -1;

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
	}

	set elems(list: HTMLElement[]) {
		this.items = list;
		this.length = list.length;
		if (this.length === 0) {
			if (this.frame) this.frame.style.cssText += ';visibility:hidden;';
			if (this.onNoData) this.onNoData();
		}
		// todo: maybe not supported
		else if (
			this.frame &&
			window.getComputedStyle(this.frame, null).visibility === 'hidden'
		) {
			this.frame.style.cssText += ';visibility:visible;';
		}
	}
}
