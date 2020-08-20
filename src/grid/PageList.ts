import bindList, { ItemFilter, ItemRender } from '../utils/bindList';
import { formatJSON } from '../utils/helper';

export type PageListConfig = {
	data?: any[];
	container: HTMLElement;
	pageDiv: HTMLElement;
	template: string;
	itemRender: ItemRender;
	itemFilter?: ItemFilter;
	pageSize: number;
	singlePage: boolean;
	pagination: Pagination;
	onNoData?: () => void;
	onSinglePage?: () => void;
	onBound?: () => void;
};

type Pagination = (pageNumber: number, pageCount: number, length: number) => string | string;

function pageArray<T>(arr: T[], startIndex: number, pageSize: number): T[] {
	let len = arr.length;
	let count = startIndex + pageSize > len ? len % pageSize : pageSize;
	return arr.slice(startIndex, startIndex + count);
}

export default class PageList {
	data?: any[];
	notPaged: boolean;
	container: HTMLElement;
	pageDiv: HTMLElement;
	template: string;
	itemRender: ItemRender;
	itemFilter?: ItemFilter;
	pageSize: number;
	singlePage: boolean;
	pagination: Pagination;
	onNoData?: Function;
	onSinglePage?: Function;
	onBound?: Function;

	pageIndex: number;
	pageCount: number;
	length: number;

	constructor(sets: PageListConfig) {
		this.notPaged = true;
		this.container = sets.container;
		this.pageDiv = sets.pageDiv;
		this.template = sets.template;
		this.itemRender = sets.itemRender;
		this.itemFilter = sets.itemFilter;
		this.pageSize = sets.pageSize || 5;
		this.pagination = sets.pagination;
		this.onNoData = sets.onNoData;
		this.onSinglePage = sets.onSinglePage;
		this.onBound = sets.onBound;
		// this.data = sets.data;
		this.reBind(sets);
	}

	reBind(sets: { data?: any[]; pageIndex?: number }) {
		this.data = sets.data;
		if (this.data) {
			this.length = sets.data.length;
			var _pageIndex = sets.pageIndex || 0;
			this.pageCount = Math.ceil(this.length / this.pageSize);
			this.pageIndex = Math.min(this.pageCount - 1, _pageIndex);
			if (this.pageCount === 1) {
				this?.onSinglePage();
			}

			if (this.length) {
				this.bindPage();
				this?.onBound();
			} else {
				this.container.innerHTML = '';
				this?.onNoData();
			}
		}
	}

	getSelectedItem(gridIndex: number) {
		return this.data[this.pageIndex * this.pageSize + gridIndex];
	}

	bindPage() {
		let dataIndex = this.pageIndex * this.pageSize;

		bindList(this.container, {
			template: this.template,
			itemRender: this.itemRender,
			itemFilter: this.itemFilter,
			list: pageArray(this.data, dataIndex, this.pageSize),
		});

		if (this.pageDiv && this.notPaged) {
			delete this.notPaged;

			this.pageDiv.style.cssText += ';display:block;';

			if (this.pagination) {
				if (typeof this.pagination === 'function') {
					this.pageDiv.innerHTML = this.pagination.call(
						this,
						this.pageIndex + 1,
						this.pageCount,
						this.length
					);
				} else {
					//string
					this.pageDiv.innerHTML = formatJSON(this.pagination, {
						pageIndex: this.pageIndex + 1,
						pageCount: this.pageCount,
						rows: this.length,
					});
				}
			} else {
				this.pageDiv.innerText = this.pageIndex + 1 + '/' + this.pageCount + ' ' + unescape('%u9875');
			}
		}
		//if (this.linkedGrid) this.linkedGrid.reset(0 , 'arrSync');
		return this;
	}

	turnPage(i: number) {
		if (i > 0) {
			this.pageIndex = this.pageIndex + i >= this.pageCount ? 0 : this.pageIndex + i;
		} else {
			this.pageIndex = this.pageIndex - i < 0 ? this.pageCount - 1 : this.pageIndex - i;
		}
		this.bindPage();
	}

	gotoPage(i: number) {
		if (i > this.pageCount - 1) {
			i = this.pageCount - 1;
		} else if (i < 0) {
			i = 0;
		}
		this.pageIndex = i;
		this.bindPage();
	}

	nextPage() {
		this.pageIndex = this.pageIndex + 1 === this.pageCount ? 0 : this.pageIndex + 1;
		this.bindPage();
	}
	prevPage() {
		this.pageIndex = this.pageIndex === 0 ? this.pageCount - 1 : this.pageIndex - 1;
		this.bindPage();
	}
}
