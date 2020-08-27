import Box from './grid/Box';
import Grid, { GridOption } from './grid/Grid';
import PageList, { PageListConfig } from './grid/PageList';
import bindList from './utils/bindList';
import * as Consts from './utils/consts';
import * as dom from './utils/dom';
import * as utils from './utils/helper';
import getJSON from './utils/http';
import log from './utils/log';

const X$ = {
	bindList,
	getJSON,
	dom,
	utils,
	Consts,
	log,
	grid: function <T = {}>(selector: string, option: GridOption) {
		return new Grid<T>(selector, option);
	},
	box: Box,
	pageList: function (cfg: PageListConfig) {
		return new PageList(cfg);
	},
};

declare global {
	interface Window {
		x$: typeof X$;
	}
	const x$: typeof X$;
}

export default X$;
