// StatAtlas data: real national statistics for ten countries, all figures from
// the World Bank's World Development Indicators (API, fetched 26 Nov 2026).
// Every figure carries its source and year; see sources.js notes in RESEARCH.md.
// Layout per country: [code, name, region, population, gdpUsd, gdpPerCapita,
// lifeExpectancy, unemploymentPct, inflationPct, literacyPct, literacyYear,
// internetPct, co2PerCapita]. literacyPct is null where the World Bank
// publishes no adult literacy rate for that country.
export const COUNTRIES = [
  ['IND', 'India', 'South Asia', 1450935791, 3760813470501, 2592, 72.2, 4.2, 5.0, 78.2, 2024, 64.9, 2.17],
  ['USA', 'United States', 'North America', 340003797, 29298013000000, 86170, 78.9, 4.0, 2.9, null, null, 94.7, 13.62],
  ['CHN', 'China', 'East Asia', 1408975000, 18729668435848, 13293, 78.0, 4.6, 0.2, 96.7, 2020, 92.0, 9.32],
  ['BRA', 'Brazil', 'South America', 211998573, 2185821610689, 10311, 76.0, 6.8, 4.4, 94.7, 2024, 84.5, 2.32],
  ['NGA', 'Nigeria', 'Sub-Saharan Africa', 232679478, 252261880140, 1084, 54.6, 3.0, 33.2, 70.4, 2024, 41.2, 0.57],
  ['DEU', 'Germany', 'Europe', 83516593, 4685592577805, 56104, 80.8, 3.4, 2.3, null, null, 93.5, 6.94],
  ['JPN', 'Japan', 'East Asia', 123975371, 4190008188359, 33797, 84.0, 2.5, 2.7, null, null, 85.5, 7.84],
  ['GBR', 'United Kingdom', 'Europe', 69281000, 3695539513534, 53341, 81.4, 4.4, 3.3, null, null, 95.5, 4.22],
  ['IDN', 'Indonesia', 'Southeast Asia', 283487931, 1396301788462, 4925, 71.3, 3.3, 2.2, 96.0, 2020, 72.8, 2.87],
  ['KEN', 'Kenya', 'Sub-Saharan Africa', 56432944, 120397537850, 2133, 63.8, 5.5, 4.5, null, null, 35.0, 0.38],
];

// Indicators: key, label, unit, decimals, source note. All 2024 unless noted.
export const INDICATORS = [
  { key: 'population', label: 'Population', unit: 'people', decimals: 0, source: 'World Bank WDI SP.POP.TOTL, 2024' },
  { key: 'gdp', label: 'GDP', unit: 'US$', decimals: 0, source: 'World Bank WDI NY.GDP.MKTP.CD, 2024' },
  { key: 'gdpPerCapita', label: 'GDP per capita', unit: 'US$', decimals: 0, source: 'World Bank WDI NY.GDP.PCAP.CD, 2024' },
  { key: 'lifeExpectancy', label: 'Life expectancy at birth', unit: 'years', decimals: 1, source: 'World Bank WDI SP.DYN.LE00.IN, 2024' },
  { key: 'unemployment', label: 'Unemployment rate', unit: '% of labour force', decimals: 1, source: 'World Bank WDI SL.UEM.TOTL.ZS (modelled ILO), 2024' },
  { key: 'inflation', label: 'Inflation, consumer prices', unit: '% annual', decimals: 1, source: 'World Bank WDI FP.CPI.TOTL.ZG, 2024' },
  { key: 'literacy', label: 'Adult literacy rate', unit: '% of people 15+', decimals: 1, source: 'World Bank WDI SE.ADT.LITR.ZS; year varies, see country' },
  { key: 'internet', label: 'People using the internet', unit: '% of population', decimals: 1, source: 'World Bank WDI IT.NET.USER.ZS, 2024' },
  { key: 'co2', label: 'CO2 emissions per capita', unit: 'tonnes', decimals: 2, source: 'World Bank WDI EN.GHG.CO2.PC.CE.AR5, 2024' },
];

// Field index into each country row, aligned with INDICATORS order.
export const FIELD_INDEX = {
  population: 3, gdp: 4, gdpPerCapita: 5, lifeExpectancy: 6, unemployment: 7,
  inflation: 8, literacy: 9, internet: 11, co2: 12,
};

// Honest time series, World Bank WDI, 2015-2024. Population in millions,
// GDP per capita in current US$. Verified point by point from the API.
export const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
export const SERIES = {
  population: {
    IND: [1328.0, 1343.9, 1359.7, 1374.7, 1389.0, 1402.6, 1414.2, 1425.4, 1438.1, 1450.9],
    USA: [321.8, 324.4, 326.6, 328.5, 330.2, 331.6, 332.1, 334.0, 336.8, 340.0],
    CHN: [1379.9, 1387.8, 1396.2, 1402.8, 1407.7, 1411.1, 1412.4, 1412.2, 1410.7, 1409.0],
  },
  gdpPerCapita: {
    IND: [1584, 1708, 1950, 1966, 2041, 1907, 2240, 2280, 2434, 2592],
    USA: [56849, 57977, 60048, 62876, 65228, 64465, 71441, 78009, 82587, 86170],
    CHN: [8175, 8255, 8980, 10086, 10343, 10627, 12887, 12971, 12951, 13293],
  },
};

export function countryByCode(code) {
  return COUNTRIES.find((c) => c[0] === code) || COUNTRIES[0];
}

export function valueOf(country, key) {
  return country[FIELD_INDEX[key]];
}

export function formatValue(key, value) {
  if (value === null || value === undefined) return 'Not published';
  if (key === 'population') return Math.round(value).toLocaleString('en-US');
  if (key === 'gdp') {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + ' tn';
    return '$' + (value / 1e9).toFixed(0) + ' bn';
  }
  if (key === 'gdpPerCapita') return '$' + Math.round(value).toLocaleString('en-US');
  if (key === 'lifeExpectancy') return value.toFixed(1) + ' yrs';
  if (key === 'unemployment' || key === 'inflation' || key === 'literacy' || key === 'internet') {
    return value.toFixed(1) + '%';
  }
  if (key === 'co2') return value.toFixed(2) + ' t';
  return String(value);
}

export function formatCompact(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + ' bn';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + ' m';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + ' k';
  return String(value);
}
