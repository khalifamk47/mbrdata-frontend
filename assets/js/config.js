export const APP_CONFIG = Object.freeze({
  // Replace this with the shared-hosting API before production deployment.
  API_BASE_URL: localStorage.getItem('clientApiBase') || 'http://127.0.0.1:8011/api',
  LOGIN_PAGE: './login.html',
  DASHBOARD_PAGE: './dashboard.html',
});

