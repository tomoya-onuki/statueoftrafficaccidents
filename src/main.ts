import { Chart } from "./Chart";

const apiURL = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEETS_ID}/values/sheet0?key=${process.env.API_KEY}`;

let chart: Chart;
window.addEventListener('load', async () => {
	const responce = await fetch(apiURL);
	const data = await responce.json();
	chart = new Chart();
	chart.entryData(data.values);
	chart.animation();
	chart.dump();
});
window.addEventListener('resize', () => chart.onResize());

