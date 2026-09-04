export const APP_CONFIG = Object.freeze({
  // Replace this with the shared-hosting API before production deployment.
  API_BASE_URL: localStorage.getItem('clientApiBase') || 'payplustechnologies/api',
  LOGIN_PAGE: './login.html',
  DASHBOARD_PAGE: './dashboard.html',
});

