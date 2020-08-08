import { delay } from './utils';


export default async function (n: number) {
	while (--n) {
		await delay(5e2, n);
	}
}

