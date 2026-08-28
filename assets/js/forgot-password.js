import { api, loadBrand, notify } from './api.js';
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="./assets/css/auth.css">');
loadBrand();
const form = document.querySelector('#forgot-form');
form.addEventListener('submit', async (event) => { event.preventDefault(); if (!form.checkValidity()) return form.reportValidity(); const email = document.querySelector('#email').value.trim(); const button = form.querySelector('button'); button.disabled = true; button.querySelector('span').textContent = 'Sending code…'; try { const result = await api('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); notify(result.message || 'Verification code sent.', 'success'); setTimeout(() => location.assign(`./reset-password.html?email=${encodeURIComponent(email)}`), 900); } catch (error) { notify(error.message, 'error'); } finally { button.disabled = false; button.querySelector('span').textContent = 'Send verification code'; } });
