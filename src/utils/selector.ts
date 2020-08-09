export default function (selector: string, context?: HTMLElement): HTMLElement[] {
	return Array.prototype.slice.call(
		(context || document).querySelectorAll(selector)
	);
}
