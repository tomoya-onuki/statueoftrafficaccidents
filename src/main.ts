import { Chart } from "./Chart";

const filename = 'data/data.csv';

let chart: Chart;
window.addEventListener('load', async () => {
	const responce = await fetch(filename);
	const data: string = await responce.text();
	const tableData: string[][] = data.split('\n').map((line: string) => {
		return line.replace('\r', '').split(',');
	});
	chart = new Chart();
	chart.entryData(tableData);
	chart.animation();
	chart.dump();

	let langToggleElem: HTMLInputElement = <HTMLInputElement>document.querySelector('#lang_toggle');
	langToggleElem.addEventListener('change', () => {
		let jaDescElem: HTMLElement = <HTMLElement>document.querySelector('#ja_desc');
		let enDescElem: HTMLElement = <HTMLElement>document.querySelector('#en_desc');

		if (langToggleElem.checked) {
			jaDescElem.style.display = 'none';
			enDescElem.style.display = 'block';
		} else {
			jaDescElem.style.display = 'block';
			enDescElem.style.display = 'none';
		}
	});
});
window.addEventListener('resize', () => chart.onResize());

