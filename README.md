# StatAtlas — National Statistics

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/idzeko50-netizen/best-national-statistics-site-20261126/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/idzeko50-netizen/best-national-statistics-site-20261126/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

A working national statistics site for ten countries — India, the United States, China, Brazil, Nigeria, Germany, Japan, the United Kingdom, Indonesia and Kenya. Every figure is real and sourced: population, GDP, GDP per capita, life expectancy, unemployment, inflation, adult literacy, internet use and CO2 per capita, all from the World Bank's World Development Indicators (2024 unless a source line says otherwise), plus population and GDP-per-capita time series for 2015–2024.

Six pages on hash routes: Overview (country picker, KPI cards, charts, sortable ten-country table), Economy, People, Health, Compare (up to three countries side by side) and Sources (every figure's source code and year, and how the data was gathered). Charts are Chart.js, vendored as a minified build under `app/vendor/`; the rest of the site is plain static files with no build step and no network request at runtime.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

Open http://localhost:8080 in a browser. The site also works opened as a static folder from any static server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ad0wkz82&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
