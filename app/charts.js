// Chart builders for StatAtlas. One job: turn data arrays into Chart.js charts
// with the site's palette, no animation (deterministic screenshots), and a
// single place that destroys old charts when a route changes.
import { YEARS, SERIES } from './data.js';

export const INK = '#14202b';
export const TEAL = '#0e6b5c';
export const AMBER = '#d97b29';
export const SLATE = '#5b6b7a';
export const GRID = '#e3e6e4';
export const SERIES_COLORS = { IND: '#0e6b5c', USA: '#d97b29', CHN: '#3e6fb0' };

let liveCharts = [];

function baseOptions(extra) {
  return Object.assign(
    {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { labels: { color: INK, font: { family: 'system-ui, sans-serif', size: 12 } } },
        tooltip: {
          backgroundColor: INK,
          titleColor: '#f4f6f5',
          bodyColor: '#f4f6f5',
          padding: 10,
          displayColors: false,
        },
      },
      scales: {
        x: { ticks: { color: SLATE, font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: SLATE, font: { size: 11 } }, grid: { color: GRID } },
      },
    },
    extra || {},
  );
}

function makeChart(canvas, config) {
  const chart = new window.Chart(canvas, config);
  liveCharts.push(chart);
  return chart;
}

export function destroyCharts() {
  for (const chart of liveCharts) chart.destroy();
  liveCharts = [];
}

// Horizontal bar chart: one indicator across all ten countries. The
// highlighted country (usually the selected one) is drawn in amber.
export function gdpPerCapitaBars(canvas, countries, values, tickFormat, highlightCode) {
  const formatTick = tickFormat || ((v) => '$' + (v / 1000).toLocaleString('en-US') + 'k');
  return makeChart(canvas, {
    type: 'bar',
    data: {
      labels: countries.map((c) => c[1]),
      datasets: [{
        data: values,
        backgroundColor: countries.map((c) => (c[0] === highlightCode ? AMBER : TEAL)),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: baseOptions({
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: {
            color: SLATE,
            font: { size: 11 },
            callback: (v) => formatTick(v),
          },
          grid: { color: GRID },
        },
        y: { ticks: { color: INK, font: { size: 12 } }, grid: { display: false } },
      },
    }),
  });
}

// Vertical bar chart: population of all ten countries, selected one highlighted.
export function populationBars(canvas, countries, values, selectedCode) {
  return makeChart(canvas, {
    type: 'bar',
    data: {
      labels: countries.map((c) => c[0]),
      datasets: [{
        data: values,
        backgroundColor: countries.map((c) => (c[0] === selectedCode ? AMBER : TEAL)),
        borderWidth: 0,
        borderRadius: 2,
      }],
    },
    options: baseOptions({
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            color: SLATE,
            font: { size: 11 },
            callback: (v) => (v / 1e9).toFixed(1) + ' bn',
          },
          grid: { color: GRID },
        },
      },
    }),
  });
}

// Line chart: a series (population or GDP per capita) 2015-2024, up to 3 countries.
export function trendLines(canvas, seriesKey, codes, unitLabel) {
  return makeChart(canvas, {
    type: 'line',
    data: {
      labels: YEARS,
      datasets: codes.map((code) => ({
        label: code,
        data: SERIES[seriesKey][code],
        borderColor: SERIES_COLORS[code] || TEAL,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: SERIES_COLORS[code] || TEAL,
        tension: 0.25,
      })),
    },
    options: baseOptions({
      scales: {
        y: {
          ticks: {
            color: SLATE,
            font: { size: 11 },
            callback: (v) => (seriesKey === 'population' ? v.toLocaleString('en-US') + ' m' : '$' + v.toLocaleString('en-US')),
          },
          grid: { color: GRID },
        },
      },
    }),
  });
}

// Grouped bars for the compare page: chosen countries across chosen indicators.
export function compareBars(canvas, codes, names, indicatorLabels, rows) {
  return makeChart(canvas, {
    type: 'bar',
    data: {
      labels: indicatorLabels,
      datasets: codes.map((code, i) => ({
        label: names[i],
        data: rows[i],
        backgroundColor: SERIES_COLORS[code] || [TEAL, AMBER, '#3e6fb0'][i % 3],
        borderWidth: 0,
        borderRadius: 2,
      })),
    },
    options: baseOptions(),
  });
}
