// StatAtlas router and controls. One job: read the hash, keep the page state,
// render the right view, and wire every control on the page so it does what
// it says. Hash routes: #/ (overview), #/economy, #/people, #/health,
// #/compare, #/sources. The country travels in the hash (?country=USA) so
// every view is a shareable, screenshotable address.
import { COUNTRIES } from './data.js';
import { overview, economy, people, health, compare, sources, NAV } from './views.js';

const app = document.getElementById('app');
const nav = document.getElementById('main-nav');

const state = {
  country: 'IND',
  chartIndicator: 'gdpPerCapita',
  sortKey: 'population',
  sortDir: 'desc',
  query: '',
  compare: ['IND', 'USA', 'CHN'],
};

const ROUTES = {
  '/': overview,
  '/economy': economy,
  '/people': people,
  '/health': health,
  '/compare': compare,
  '/sources': sources,
};

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart === '' ? '/' : pathPart;
  const params = new URLSearchParams(queryPart || '');
  const country = params.get('country');
  if (country && COUNTRIES.some((c) => c[0] === country)) state.country = country;
  return path;
}

function renderNav(path) {
  nav.innerHTML = NAV.map(([href, label]) => {
    const active = href === '#' + path;
    return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
}

function render() {
  window.__shotReady = false;
  const path = parseHash();
  const view = ROUTES[path] || overview;
  document.title = `${path === '/' ? 'Overview' : path.slice(1).replace(/^\w/, (c) => c.toUpperCase())} | StatAtlas — National Statistics`;
  renderNav(path);
  view(app, state);
  wireControls(path);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wireControls(path) {
  const picker = document.getElementById('country-picker');
  if (picker) {
    picker.addEventListener('change', () => {
      state.country = picker.value;
      const [base] = location.hash.replace(/^#/, '').split('?');
      location.hash = `#${base}?country=${picker.value}`;
    });
  }
  const search = document.getElementById('table-search');
  if (search) {
    search.addEventListener('input', () => {
      state.query = search.value;
      const scroll = window.scrollY;
      render();
      const again = document.getElementById('table-search');
      if (again) {
        again.focus();
        again.setSelectionRange(again.value.length, again.value.length);
      }
      window.scrollTo(0, scroll);
    });
  }
  app.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (key === 'country') {
        state.sortKey = 'population';
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      } else if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      } else {
        state.sortKey = key;
        state.sortDir = 'desc';
      }
      render();
    });
    th.style.cursor = 'pointer';
  });
  if (path === '/compare') {
    // Compare pickers wire themselves in views.js.
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('statatlas:rerender', render);
render();
