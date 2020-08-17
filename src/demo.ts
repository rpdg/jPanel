import { delay, selector } from './utils';


export default async function (n: number) {
	console.log(selector('p'));
	while (--n) {
		await delay(5e2, n);
	}
}
