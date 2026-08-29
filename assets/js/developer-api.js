import { APP_CONFIG } from './config.js';
import { api, getSession, notify } from './api.js';
import { bootShell, copyText } from './shell.js';

const cachedUser = bootShell('developer-api');
const baseUrl = APP_CONFIG.API_BASE_URL.replace(/\/$/, '');
const endpoints = [
  ['Data catalogue', 'GET', '/data/catalog', 'Returns networks, data types and live plans.'],
  ['Buy data', 'POST', '/data/purchase', 'Purchase a data plan using its plan ID.'],
  ['Airtime catalogue', 'GET', '/airtime/catalog', 'Returns networks, availability and rates.'],
  ['Buy airtime', 'POST', '/airtime/purchase', 'Purchase VTU airtime for a phone number.'],
  ['Cable catalogue', 'GET', '/cable/catalog', 'Returns providers and subscription packages.'],
  ['Verify cable account', 'POST', '/cable/verify', 'Validate a decoder or smart-card number.'],
  ['Buy cable package', 'POST', '/cable/purchase', 'Purchase the selected TV package.'],
  ['Electricity catalogue', 'GET', '/electricity/catalog', 'Returns supported distribution companies.'],
  ['Verify meter', 'POST', '/electricity/verify', 'Validate meter number and customer details.'],
  ['Buy electricity', 'POST', '/electricity/purchase', 'Purchase electricity and return a token.'],
  ['Exam catalogue', 'GET', '/exam/catalog', 'Returns available exam PIN products.'],
  ['Buy exam PIN', 'POST', '/exam/purchase', 'Purchase one or more examination PINs.'],
  ['Transactions', 'GET', '/transactions', 'Returns transaction history for the account.'],
  ['Wallet balance', 'GET', '/wallet/balance', 'Returns the current wallet balance.'],
];

document.querySelector('#api-base').textContent = baseUrl;
let apiKey = cachedUser.apikey || cachedUser.api_key || getSession().token || '';
let keyVisible = false;
const keyNode = document.querySelector('#api-key');
function renderKey() { keyNode.textContent = keyVisible ? (apiKey || 'Not available') : (apiKey ? `${apiKey.slice(0, 7)}${'•'.repeat(Math.min(18, Math.max(8, apiKey.length - 10)))}${apiKey.slice(-4)}` : 'Not available'); }
renderKey();

document.querySelector('#endpoint-list').innerHTML = endpoints.map(([name, method, path, note]) => `<article class="endpoint-row"><span class="method ${method.toLowerCase()}">${method}</span><div><b>${name}</b><code>${path}</code><small>${note}</small></div><button type="button" data-path="${path}" aria-label="Copy endpoint"><i class="bi bi-copy"></i></button></article>`).join('');
document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => {
  const value = button.dataset.copy === 'api-key' ? apiKey : document.querySelector(`#${button.dataset.copy}`).textContent;
  copyText(value, 'Copied to clipboard.');
}));
document.querySelectorAll('[data-path]').forEach((button) => button.addEventListener('click', () => copyText(`${baseUrl}${button.dataset.path}`, 'Endpoint copied.')));
document.querySelector('#toggle-key').addEventListener('click', (event) => { keyVisible = !keyVisible; event.currentTarget.querySelector('i').className = `bi bi-eye${keyVisible ? '-slash' : ''}`; renderKey(); });

api('/me').then((response) => {
  const user = response.user || response.data || response;
  apiKey = user.apikey || user.api_key || apiKey;
  renderKey();
}).catch(() => notify('Using your locally saved API credential.', 'info'));
