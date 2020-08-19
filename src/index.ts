import Box from './grid/Box';
import Grid from './grid/Grid';
import PageList from './grid/PageList';
import bindList from './utils/bindList';
import * as Consts from './utils/consts';
import * as dom from './utils/dom';
import * as utils from './utils/helper';
import getJSON from './utils/http';

const x$ = {
	bindList,
	getJSON,
	dom,
	utils,
	Grid,
	Box,
	PageList,
	Consts,
};

export default x$;
