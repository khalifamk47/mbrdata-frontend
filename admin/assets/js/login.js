import { ADMIN_CONFIG } from './config.js';
import { api, saveSession, session } from './api.js';

if (session().token) location.replace(ADMIN_CONFIG.DASHBOARD_PAGE);
const form = document.querySelector('#login-form');
document.querySelector('#toggle-password').onclick = () => { const input = document.querySelector('#password'); input.type = input.type === 'password' ? 'text' : 'password'; };
form.onsubmit = async (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim(), password = document.querySelector('#password').value;
  Swal.fire({ title: 'Signing you in...', html: '<div class="admin-loader"><i></i><i></i><i></i><i></i></div>', allowOutsideClick: false, showConfirmButton: false });
  try {
    const result = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    saveSession(result);
    await Swal.fire({ icon: 'success', title: 'Welcome back', text: result.message, confirmButtonText: 'Open Dashboard' });
    location.replace(ADMIN_CONFIG.DASHBOARD_PAGE);
  } catch (error) { Swal.fire({ icon: 'error', title: 'Login failed', text: error.message }); }
};
