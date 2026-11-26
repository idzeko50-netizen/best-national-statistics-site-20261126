// Page renderers for StatAtlas. One job: turn the current state into the HTML
// of one hash route, then mount its charts. Every route is a real page reached
// by a link; every control it shows is wired up in main.js after render.
import { COUNTRIES, INDICATORS, countryByCode, valueOf, formatValue } from './data.js';
import { destroyCharts, gdpPerCapitaBars, populationBars, trendLines, compareBars } from './charts.js';

export const NAV = [
  ['#/', 'Overview'],
  ['#/economy', 'Economy'],
  ['#/people', 'People'],
  ['#/health', 'Health'],
  ['#/compare', 'Compare'],
  ['#/sources', 'Sources'],
];

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function countryOptions(selected) {
  return COUNTRIES.map((c) => `<option value="${c[0]}"${c[0] === selected ? ' selected' : ''}>${esc(c[1])}</option>`).join('');
}

function picker(state, label) {
  return `<label class="picker"><span>${label}</span><select id="country-picker" aria-label="Choose a country">${countryOptions(state.country)}</select></label>`;
}

function kpiCards(country, keys) {
  return `<div class="kpis">${keys.map((key) => {
    const ind = INDICATORS.find((i) => i.key === key);
    const value = valueOf(country, key);
    const note = key === 'literacy' && value === null ? 'World Bank publishes no rate' : ind.source.split(',').pop().trim();
    return `<div class="kpi"><p class="kpi-value">${esc(formatValue(key, value))}</p><p class="kpi-label">${esc(ind.label)}</p><p class="kpi-source">${esc(note)}</p></div>`;
  }).join('')}</div>`;
}

function chartPanel(id, title, note, height) {
  return `<section class="panel"><div class="panel-head"><h2>${esc(title)}</h2><p>${esc(note)}</p></div><div class="chart-wrap" style="height:${height || 320}px"><canvas id="${id}"></canvas></div></section>`;
}

function tableToolbar(state) {
  return `<div class="table-tools"><label class="search"><span>Search</span><input id="table-search" type="search" placeholder="Filter by country or region" value="${esc(state.query || '')}" aria-label="Filter table"></label><p class="table-hint">Click a column heading to sort.</p></div>`;
}

function countryTable(state, keys) {
  const rows = COUNTRIES.filter((c) => {
    const q = (state.query || '').trim().toLowerCase();
    return !q || c[1].toLowerCase().includes(q) || c[2].toLowerCase().includes(q) || c[0].toLowerCase().includes(q);
  });
  const sortKey = state.sortKey || 'population';
  const dir = state.sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    const va = valueOf(a, sortKey);
    const vb = valueOf(b, sortKey);
    if (va === null) return 1;
    if (vb === null) return -1;
    return (va - vb) * dir;
  });
  const heads = ['<th data-sort="country" scope="col">Country</th>'].concat(
    keys.map((key) => {
      const ind = INDICATORS.find((i) => i.key === key);
      const arrow = sortKey === key ? (dir === 1 ? ' ▲' : ' ▼') : '';
      return `<th data-sort="${key}" scope="col">${esc(ind.label)}${arrow}</th>`;
    }),
  ).join('');
  const body = rows.map((c) => `<tr${c[0] === state.country ? ' class="selected-row"' : ''}><td><a href="#/?country=${c[0]}">${esc(c[1])}</a><span class="region">${esc(c[2])}</span></td>${keys.map((key) => `<td>${esc(formatValue(key, valueOf(c, key)))}</td>`).join('')}</tr>`).join('');
  return `<div class="table-scroll"><table class="data-table"><thead><tr>${heads}</tr></thead><tbody>${body || '<tr><td colspan="9">No countries match that search.</td></tr>'}</tbody></table></div>`;
}

function countryIntro(country) {
  const popRank = [...COUNTRIES].sort((a, b) => b[3] - a[3]).findIndex((c) => c[0] === country[0]) + 1;
  const gdpRank = [...COUNTRIES].sort((a, b) => b[4] - a[4]).findIndex((c) => c[0] === country[0]) + 1;
  return `<p class="lede">${esc(country[1])} is the ${ordinal(popRank)} most populous of the ten countries in this atlas and has the ${ordinal(gdpRank)} largest economy of the ten. Every figure below comes from the World Bank's World Development Indicators, 2024 unless a source line says otherwise.</p>`;
}

function ordinal(n) {
  return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
}

function pageHead(state, title, intro) {
  return `<div class="page-head"><div class="page-head-text"><h1>${esc(title)}</h1>${intro || ''}</div>${picker(state, 'Country')}</div>`;
}

// ---- Overview: picker, KPIs, two charts, full sortable table ----
export function overview(app, state) {
  destroyCharts();
  const country = countryByCode(state.country);
  const indicator = state.chartIndicator || 'gdpPerCapita';
  const ind = INDICATORS.find((i) => i.key === indicator);
  app.innerHTML = `
    ${pageHead(state, country[1], countryIntro(country))}
    ${kpiCards(country, ['population', 'gdp', 'gdpPerCapita', 'lifeExpectancy', 'unemployment', 'inflation'])}
    <div class="chart-grid">
      ${chartPanel('chart-bars', `${ind.label} across all ten countries`, 'World Bank, 2024. The selected country is shown in amber.', 200)}
      ${chartPanel('chart-trend', 'Population 2015–2024', 'Millions of people. India, the United States and China. World Bank WDI.', 200)}
    </div>
    <section class="panel"><div class="panel-head"><h2>All ten countries</h2><p>Every indicator, 2024. Click a heading to sort.</p></div>
    ${tableToolbar(state)}
    ${countryTable(state, ['population', 'gdp', 'gdpPerCapita', 'lifeExpectancy', 'unemployment', 'inflation'])}
    <p class="panel-foot">Sources: World Bank World Development Indicators. Literacy and internet use are on the People page.</p></section>`;
  const barCanvas = document.getElementById('chart-bars');
  if (indicator === 'population') {
    populationBars(barCanvas, COUNTRIES, COUNTRIES.map((c) => valueOf(c, 'population')), state.country);
  } else if (indicator === 'lifeExpectancy') {
    gdpPerCapitaBars(barCanvas, COUNTRIES, COUNTRIES.map((c) => valueOf(c, indicator)), (v) => v.toFixed(0) + ' yrs', state.country);
  } else if (indicator === 'co2') {
    gdpPerCapitaBars(barCanvas, COUNTRIES, COUNTRIES.map((c) => valueOf(c, indicator)), (v) => v.toFixed(1) + ' t', state.country);
  } else {
    gdpPerCapitaBars(barCanvas, COUNTRIES, COUNTRIES.map((c) => valueOf(c, indicator)), undefined, state.country);
  }
  trendLines(document.getElementById('chart-trend'), 'population', ['IND', 'USA', 'CHN']);
  wireIndicatorSwitcher(state);
}

function wireIndicatorSwitcher(state) {
  const panel = document.querySelector('.panel-head h2');
  if (!panel) return;
  const select = document.createElement('select');
  select.id = 'indicator-switch';
  select.setAttribute('aria-label', 'Choose the chart indicator');
  select.innerHTML = ['gdpPerCapita', 'population', 'lifeExpectancy', 'co2'].map((key) => {
    const ind = INDICATORS.find((i) => i.key === key);
    return `<option value="${key}"${key === (state.chartIndicator || 'gdpPerCapita') ? ' selected' : ''}>${esc(ind.label)}</option>`;
  }).join('');
  const head = panel.parentElement;
  const note = head.querySelector('p');
  const wrap = document.createElement('div');
  wrap.className = 'switch-wrap';
  wrap.appendChild(document.createTextNode('Chart shows '));
  wrap.appendChild(select);
  head.insertBefore(wrap, note);
  select.addEventListener('change', () => {
    state.chartIndicator = select.value;
    window.dispatchEvent(new CustomEvent('statatlas:rerender'));
  });
}

// ---- Economy ----
export function economy(app, state) {
  destroyCharts();
  const country = countryByCode(state.country);
  app.innerHTML = `
    ${pageHead(state, `The economy of ${country[1]}`, `<p class="lede">Output, income, prices and jobs — ${esc(country[1])}'s economy in four numbers, then the ten-country picture.</p>`)}
    ${kpiCards(country, ['gdp', 'gdpPerCapita', 'inflation', 'unemployment'])}
    <div class="chart-grid">
      ${chartPanel('chart-gdpcap', 'GDP per capita 2015–2024', 'Current US$. India, the United States and China. World Bank WDI.', 280)}
      ${chartPanel('chart-gdpbars', 'GDP per capita across all ten countries', 'Current US$, 2024. World Bank WDI.', 280)}
    </div>
    <section class="panel"><div class="panel-head"><h2>Economy table</h2><p>GDP, income per person, inflation and unemployment, 2024.</p></div>
    ${tableToolbar(state)}
    ${countryTable(state, ['gdp', 'gdpPerCapita', 'inflation', 'unemployment'])}
    <p class="panel-foot">Unemployment is the modelled ILO estimate. Inflation is the annual change in consumer prices.</p></section>`;
  trendLines(document.getElementById('chart-gdpcap'), 'gdpPerCapita', ['IND', 'USA', 'CHN']);
  gdpPerCapitaBars(document.getElementById('chart-gdpbars'), COUNTRIES, COUNTRIES.map((c) => valueOf(c, 'gdpPerCapita')), undefined, state.country);
}

// ---- People ----
export function people(app, state) {
  destroyCharts();
  const country = countryByCode(state.country);
  app.innerHTML = `
    ${pageHead(state, `The people of ${country[1]}`, `<p class="lede">How many people live there, how long they live, and how connected and literate they are.</p>`)}
    ${kpiCards(country, ['population', 'lifeExpectancy', 'literacy', 'internet'])}
    <div class="chart-grid">
      ${chartPanel('chart-pop', 'Population of all ten countries', 'People, 2024. The selected country is shown in amber.', 280)}
      ${chartPanel('chart-poptrend', 'Population 2015–2024', 'Millions of people. India, the United States and China. World Bank WDI.', 280)}
    </div>
    <section class="panel"><div class="panel-head"><h2>People table</h2><p>Population, life expectancy, literacy and internet use.</p></div>
    ${tableToolbar(state)}
    ${countryTable(state, ['population', 'lifeExpectancy', 'literacy', 'internet'])}
    <p class="panel-foot">Adult literacy is not published by the World Bank for the United States, Germany, Japan, the United Kingdom or Kenya; those cells say so rather than guessing. China's and Indonesia's latest published rates are from 2020.</p></section>`;
  populationBars(document.getElementById('chart-pop'), COUNTRIES, COUNTRIES.map((c) => valueOf(c, 'population')), state.country);
  trendLines(document.getElementById('chart-poptrend'), 'population', ['IND', 'USA', 'CHN']);
}

// ---- Health ----
export function health(app, state) {
  destroyCharts();
  const country = countryByCode(state.country);
  app.innerHTML = `
    ${pageHead(state, `Health and environment in ${country[1]}`, `<p class="lede">Life expectancy and the carbon footprint per person — the two headline numbers for health and the environment.</p>`)}
    ${kpiCards(country, ['lifeExpectancy', 'co2', 'population', 'internet'])}
    <div class="chart-grid">
      ${chartPanel('chart-life', 'Life expectancy at birth', 'Years, 2024. World Bank WDI.', 280)}
      ${chartPanel('chart-co2', 'CO2 emissions per person', 'Tonnes per capita, 2024. World Bank WDI (AR5 greenhouse-gas accounts).', 280)}
    </div>
    <section class="panel"><div class="panel-head"><h2>Health table</h2><p>Life expectancy and CO2 per person for all ten countries.</p></div>
    ${tableToolbar(state)}
    ${countryTable(state, ['lifeExpectancy', 'co2', 'population'])}
    <p class="panel-foot">Life expectancy is the number of years a newborn would live if current mortality patterns stayed the same.</p></section>`;
  gdpPerCapitaBars(document.getElementById('chart-life'), COUNTRIES, COUNTRIES.map((c) => valueOf(c, 'lifeExpectancy')), (v) => v.toFixed(0) + ' yrs', state.country);
  const co2Canvas = document.getElementById('chart-co2');
  populationBars(co2Canvas, COUNTRIES, COUNTRIES.map((c) => valueOf(c, 'co2')), state.country);
}

// ---- Compare ----
export function compare(app, state) {
  destroyCharts();
  const picked = state.compare.slice(0, 3);
  while (picked.length < 3) picked.push(COUNTRIES[picked.length][0]);
  const names = picked.map((code) => countryByCode(code)[1]);
  const keys = ['gdpPerCapita', 'lifeExpectancy', 'internet', 'co2'];
  // Normalise each indicator to 0-100 so different units share one chart.
  const rows = picked.map((code) => {
    const country = countryByCode(code);
    return keys.map((key) => {
      const vals = COUNTRIES.map((c) => valueOf(c, key)).filter((v) => v !== null);
      const max = Math.max(...vals);
      const v = valueOf(country, key);
      return v === null ? 0 : (v / max) * 100;
    });
  });
  app.innerHTML = `
    <div class="page-head"><div class="page-head-text"><h1>Compare countries</h1><p class="lede">Pick up to three countries and see them side by side. The chart scales each indicator to the highest of the ten, so different units share one picture — the table below keeps the real numbers.</p></div></div>
    <div class="compare-pickers">
      ${[0, 1, 2].map((i) => `<label class="picker"><span>Country ${i + 1}</span><select class="compare-pick" data-slot="${i}" aria-label="Compare country ${i + 1}">${countryOptions(picked[i])}</select></label>`).join('')}
    </div>
    <div class="chart-full">
      ${chartPanel('chart-compare', `${names.join(' vs ')}`, 'Each bar is a share of the highest value among the ten countries.', 280)}
    </div>
    <section class="panel"><div class="panel-head"><h2>Side by side</h2><p>Real figures, 2024 unless noted.</p></div>
    <div class="table-scroll"><table class="data-table compare-table"><thead><tr><th scope="col">Indicator</th>${names.map((n) => `<th scope="col">${esc(n)}</th>`).join('')}</tr></thead>
    <tbody>${INDICATORS.map((ind) => `<tr><td>${esc(ind.label)} <span class="region">${esc(ind.unit)}</span></td>${picked.map((code) => `<td>${esc(formatValue(ind.key, valueOf(countryByCode(code), ind.key)))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="panel-foot">Literacy: not published for the United States, Germany, Japan, the United Kingdom or Kenya.</p></section>`;
  compareBars(
    document.getElementById('chart-compare'),
    picked,
    names,
    keys.map((k) => INDICATORS.find((i) => i.key === k).label),
    rows,
  );
  app.querySelectorAll('.compare-pick').forEach((select) => {
    select.addEventListener('change', () => {
      state.compare[Number(select.dataset.slot)] = select.value;
      window.dispatchEvent(new CustomEvent('statatlas:rerender'));
    });
  });
}

// ---- Sources ----
export function sources(app, state) {
  destroyCharts();
  app.innerHTML = `
    <div class="page-head"><div class="page-head-text"><h1>Sources and method</h1><p class="lede">Every figure on this site comes from one place: the World Bank's World Development Indicators, pulled from its public API on 26 November 2026. Nothing here is estimated by us, and nothing is copied from another statistics site.</p></div></div>
    <section class="panel"><div class="panel-head"><h2>Every indicator, with its source</h2><p>Indicator codes are the World Bank's own.</p></div>
    <div class="table-scroll"><table class="data-table"><thead><tr><th scope="col">Indicator</th><th scope="col">World Bank code</th><th scope="col">Year</th><th scope="col">Note</th></tr></thead>
    <tbody>
      <tr><td>Population</td><td>SP.POP.TOTL</td><td>2024</td><td>Total population, mid-year estimate.</td></tr>
      <tr><td>GDP (current US$)</td><td>NY.GDP.MKTP.CD</td><td>2024</td><td>Gross domestic product at market prices.</td></tr>
      <tr><td>GDP per capita</td><td>NY.GDP.PCAP.CD</td><td>2024</td><td>GDP divided by mid-year population.</td></tr>
      <tr><td>Life expectancy at birth</td><td>SP.DYN.LE00.IN</td><td>2024</td><td>Years a newborn would live at current mortality rates.</td></tr>
      <tr><td>Unemployment rate</td><td>SL.UEM.TOTL.ZS</td><td>2024</td><td>Modelled ILO estimate, share of the labour force.</td></tr>
      <tr><td>Inflation, consumer prices</td><td>FP.CPI.TOTL.ZG</td><td>2024</td><td>Annual percentage change in the consumer price index.</td></tr>
      <tr><td>Adult literacy rate</td><td>SE.ADT.LITR.ZS</td><td>2020–2024</td><td>Share of people aged 15+ who can read and write. Not published for the United States, Germany, Japan, the United Kingdom or Kenya; China and Indonesia latest 2020.</td></tr>
      <tr><td>People using the internet</td><td>IT.NET.USER.ZS</td><td>2024</td><td>Share of the population who used the internet in the last three months.</td></tr>
      <tr><td>CO2 emissions per capita</td><td>EN.GHG.CO2.PC.CE.AR5</td><td>2024</td><td>Metric tonnes of CO2 per person, AR5 greenhouse-gas accounts.</td></tr>
      <tr><td>Population and GDP per capita, 2015–2024</td><td>SP.POP.TOTL / NY.GDP.PCAP.CD</td><td>2015–2024</td><td>Each yearly point verified from the API; no interpolation.</td></tr>
    </tbody></table></div>
    <p class="panel-foot">Figures are shown rounded for reading; the underlying values are the World Bank's published values. Where the World Bank has not published a figure, the site says so instead of filling the gap.</p></section>
    <section class="panel"><div class="panel-head"><h2>How the data was gathered</h2></div>
    <ol class="method">
      <li>Each indicator was fetched for all ten countries from the World Bank API (api.worldbank.org) for 2015–2024.</li>
      <li>The latest published year was taken for each country and indicator — 2024 for every indicator except adult literacy, where the latest published year is used per country.</li>
      <li>Values were copied into the site's data file with their source code and year; no figure was calculated, estimated or rounded beyond display.</li>
      <li>Time-series charts show the published yearly values only; missing years are not interpolated.</li>
    </ol></section>`;
}
