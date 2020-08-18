
import { delay, selector } from './utils';


export default async function (n: number) {
	// console.log(selector('p'));
	const p1 = selector('p')[0];
	while (--n) {
		await delay(7e2, n);
		p1.innerHTML = String(n);
	}
}
