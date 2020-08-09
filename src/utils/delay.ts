export default function delay(interval: number, num: number) {
	return new Promise((resolve) =>
		setTimeout(() => {
			// console.log('num=>' , num);
			resolve();
		}, interval)
	);
}
