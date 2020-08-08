export default function (selector: string, context?: HTMLElement): Element[] {
	return Array.prototype.slice.call(
		(context || document).querySelectorAll(selector)
	);
}
