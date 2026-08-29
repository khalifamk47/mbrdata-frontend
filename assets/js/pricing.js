import { api, money, notify } from './api.js';
import { bootShell } from './shell.js';

bootShell('pricing');

const state = { active: 'airtime', catalogs: {}, loaded: false };
const content = document.querySelector('#pricing-content');
const summary = document.querySelector('#catalog-summary');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const tierPrice = (plan, key = 'smart') => money(plan?.prices?.[key] ?? plan?.amount ?? plan?.price ?? 0);
const status = (available) => `<span class="catalog-status ${available === false ? 'off' : ''}"><i></i>${available === false ? 'Unavailable' : 'Available'}</span>`;

function table(headers, rows) {
  return `<div class="catalog-table-wrap"><table class="catalog-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.join('') : `<tr><td colspan="${headers.length}"><div class="catalog-empty"><i class="bi bi-inbox"></i><b>No pricing available</b><small>The backend returned no active plans for this service.</small></div></td></tr>`}</tbody></table></div>`;
}

function renderAirtime() {
  const rows = (state.catalogs.airtime?.networks || []).map((network) => `<tr><td><b>${escapeHtml(network.name)}</b></td><td>${escapeHtml(network.network_id)}</td><td>${Number(network.prices?.smart ?? network.rate ?? 1).toFixed(3)}</td><td>${Number(network.prices?.topup ?? network.rate ?? 1).toFixed(3)}</td><td>${Number(network.prices?.affiliate ?? network.rate ?? 1).toFixed(3)}</td><td>${Number(network.prices?.api ?? network.rate ?? 1).toFixed(3)}</td><td>${status(network.available)}</td></tr>`);
  return table(['Network', 'ID', 'Smart rate', 'Topup rate', 'Affiliate', 'API rate', 'Status'], rows);
}

function renderData() {
  const rows = [];
  (state.catalogs.data?.networks || []).forEach((network) => (network.types || []).forEach((type) => (type.plans || []).forEach((plan) => rows.push(`<tr><td><b>${escapeHtml(network.name)}</b></td><td>${escapeHtml(type.label)}</td><td>${escapeHtml(plan.planid || plan.id)}</td><td>${escapeHtml(plan.size || plan.name)}</td><td>${escapeHtml(plan.validity)} ${String(plan.validity) === '1' ? 'Day' : 'Days'}</td><td>${tierPrice(plan)}</td><td>${tierPrice(plan, 'api')}</td></tr>`))));
  return table(['Network', 'Type', 'Plan ID', 'Plan', 'Validity', 'User price', 'API price'], rows);
}

function renderCable() {
  const rows = [];
  (state.catalogs.cable?.providers || []).forEach((provider) => (provider.plans || []).forEach((plan) => rows.push(`<tr><td><b>${escapeHtml(provider.name)}</b></td><td>${escapeHtml(plan.planid || plan.id)}</td><td>${escapeHtml(plan.name)}</td><td>${tierPrice(plan)}</td><td>${tierPrice(plan, 'api')}</td><td>${status(provider.available)}</td></tr>`)));
  return table(['Provider', 'Plan ID', 'Package', 'User price', 'API price', 'Status'], rows);
}

function renderElectricity() {
  const catalog = state.catalogs.electricity || {};
  const rows = (catalog.providers || []).map((provider) => `<tr><td><b>${escapeHtml(provider.name)}</b></td><td>${escapeHtml(provider.disco)}</td><td>${escapeHtml(provider.abbreviation)}</td><td>${money(catalog.minimum_amount || 100)} minimum</td><td>${status(provider.available)}</td></tr>`);
  return table(['Distribution company', 'ID', 'Code', 'Amount rule', 'Status'], rows);
}

function renderExam() {
  const rows = [];
  (state.catalogs.exam?.providers || []).forEach((provider) => (provider.plans || []).forEach((plan) => rows.push(`<tr><td><b>${escapeHtml(provider.name)}</b></td><td>${escapeHtml(plan.examid || plan.id)}</td><td>${escapeHtml(plan.name)}</td><td>${tierPrice(plan)}</td><td>${tierPrice(plan, 'api')}</td></tr>`)));
  return table(['Provider', 'Plan ID', 'Product', 'User price', 'API price'], rows);
}

function renderSpecial() {
  const rows = [];
  [['Smile', 'smile'], ['Alpha Topup', 'alpha'], ['Ratel', 'ratel'], ['Kirani', 'kirani']].forEach(([label, key]) => (state.catalogs[key]?.plans || []).forEach((plan) => rows.push(`<tr><td><b>${label}</b></td><td>${escapeHtml(plan.planid || plan.id)}</td><td>${escapeHtml(plan.name || plan.description)}</td><td>${escapeHtml(plan.minutes || '—')}</td><td>${tierPrice(plan)}</td><td>${tierPrice(plan, 'api')}</td></tr>`)));
  return table(['Service', 'Plan ID', 'Plan', 'Minutes', 'User price', 'API price'], rows);
}

function render() {
  const renderers = { airtime: renderAirtime, data: renderData, cable: renderCable, electricity: renderElectricity, exam: renderExam, special: renderSpecial };
  content.innerHTML = renderers[state.active]();
}

async function loadPricing() {
  content.innerHTML = '<div class="catalog-loading"><span></span><p>Fetching live prices…</p></div>';
  summary.textContent = 'Connecting to the backend service catalog…';
  const services = { airtime: '/airtime/catalog', data: '/data/catalog', cable: '/cable/catalog', electricity: '/electricity/catalog', exam: '/exam/catalog', smile: '/smile/catalog', alpha: '/alpha/catalog', ratel: '/ratel/catalog', kirani: '/kirani/catalog' };
  const entries = Object.entries(services);
  const results = await Promise.allSettled(entries.map(([, endpoint]) => api(endpoint)));
  let successCount = 0;
  results.forEach((result, index) => { if (result.status === 'fulfilled') { state.catalogs[entries[index][0]] = result.value; successCount += 1; } });
  state.loaded = true;
  summary.textContent = `${successCount} of ${entries.length} live catalog sources loaded · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (!successCount) notify('The pricing catalog could not be reached.', 'error');
  render();
}

document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((item) => item.classList.remove('active'));
  button.classList.add('active'); state.active = button.dataset.tab; if (state.loaded) render();
}));
document.querySelector('#refresh-pricing').addEventListener('click', loadPricing);
loadPricing();
