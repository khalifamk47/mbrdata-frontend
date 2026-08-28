import { APP_CONFIG } from './config.js';
import { api, clearSession, getSession, loadBrand, money, notify, requireAuth } from './api.js';

requireAuth();
loadBrand();
const { user } = getSession();
const displayName = user.username || user.name || 'User';
document.querySelector('#user-name').textContent = displayName;
document.querySelector('#avatar').textContent = displayName.slice(0, 1).toUpperCase();
document.querySelector('#greeting').textContent = `${greeting()}, ${displayName}`;

const services = [
  ['wifi', 'Buy Data'], ['telephone', 'Airtime'], ['lightning-charge', 'Electricity'],
  ['tv', 'Cable TV'], ['ticket-perforated', 'Exam PIN'], ['emoji-smile', 'Smile Data'],
  ['person-vcard', 'NIN'], ['fingerprint', 'BVN'],
];
document.querySelector('#service-grid').innerHTML = services.map(([icon, label]) => `<button class="service-card" data-coming-soon><span><i class="bi bi-${icon}"></i></span><b>${label}</b><small>Open service</small></button>`).join('');

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function status(value) { const s = String(value ?? '').toLowerCase(); return ['1','success','successful'].includes(s) ? ['Successful','success'] : ['2','pending'].includes(s) ? ['Pending','pending'] : ['Failed','failed']; }
function renderTransactions(rows) {
  const node = document.querySelector('#transaction-list');
  if (!rows.length) { node.innerHTML = '<div class="empty-state"><i class="bi bi-receipt"></i><b>No transactions yet</b><span>Your latest payments will appear here.</span></div>'; return; }
  node.innerHTML = rows.map((tx) => { const [label, cls] = status(tx.status); return `<article class="transaction"><span class="tx-icon"><i class="bi bi-receipt"></i></span><div><b>${String(tx.service || tx.network || tx.type || 'Transaction').toUpperCase()}</b><small>${[tx.mobile, tx.plans, tx.date].filter(Boolean).join(' · ') || 'Transaction record'}</small></div><div class="tx-value"><b>${money(tx.amount)}</b><span class="status ${cls}">${label}</span></div></article>`; }).join('');
}

async function boot() {
  try {
    const [summary, transactions] = await Promise.all([api('/dashboard/summary'), api('/transactions?limit=5')]);
    document.querySelector('#wallet-balance').textContent = money(summary.wallet_balance || user.bal);
    document.querySelector('#earning-balance').textContent = money(summary.refbal || user.refbal);
    document.querySelector('#tx-count').textContent = summary.transactions?.total || 0;
    renderTransactions(Array.isArray(transactions.transactions) ? transactions.transactions : []);
  } catch (error) {
    if (error.status === 401) { clearSession(); location.replace(APP_CONFIG.LOGIN_PAGE); return; }
    notify(error.message, 'error'); renderTransactions([]);
  }
}

document.querySelector('#logout').addEventListener('click', () => { clearSession(); location.replace(APP_CONFIG.LOGIN_PAGE); });
const sidebar = document.querySelector('.sidebar');
document.querySelector('#menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
document.querySelector('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
document.querySelectorAll('[data-coming-soon]').forEach((node) => node.addEventListener('click', (event) => { event.preventDefault(); notify('This service page will be migrated next.'); }));
boot();

