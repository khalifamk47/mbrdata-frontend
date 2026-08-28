import { APP_CONFIG } from './config.js';
import { api, getSession, loadBrand, notify, saveSession } from './api.js';

if (getSession().token) location.replace(APP_CONFIG.DASHBOARD_PAGE);
loadBrand();

const form = document.querySelector('#login-form');
const submit = form.querySelector('[type="submit"]');
document.querySelector('#toggle-password').addEventListener('click', () => {
  const input = document.querySelector('#password');
  input.type = input.type === 'password' ? 'text' : 'password';
});
document.querySelectorAll('[data-coming-soon]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  notify('This page will be migrated next.');
}));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const phone = document.querySelector('#phone').value.trim();
  const password = document.querySelector('#password').value;
  if (!phone || !password) return notify('Enter your phone number and password.', 'error');
  submit.disabled = true;
  submit.classList.add('loading');
  try {
    const result = await api('/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
    saveSession(result);
    location.replace(APP_CONFIG.DASHBOARD_PAGE);
  } catch (error) {
    notify(error.message, 'error');
  } finally {
    submit.disabled = false;
    submit.classList.remove('loading');
  }
});

