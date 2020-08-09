export const getBoundingClientRect = function (el: HTMLElement) {
	if (el.getBoundingClientRect) return el.getBoundingClientRect();
	let left = 0,
		top = 0,
		width = el.offsetWidth,
		height = el.offsetHeight;
	do {
		left += el.offsetLeft;
		top += el.offsetTop;
	} while ((el = el.offsetParent as HTMLElement));

	return {
		left: Math.round(left),
		top: Math.round(top),
		width: width,
		height: height,
	};
};
