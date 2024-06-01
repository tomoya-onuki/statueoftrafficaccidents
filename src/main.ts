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
});
window.addEventListener('resize', () => chart.onResize());

