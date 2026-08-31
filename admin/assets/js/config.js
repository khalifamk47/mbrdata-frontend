export const ADMIN_CONFIG = {
  API_BASE_URL: localStorage.getItem('adminApiBase') || 'http://127.0.0.1:8011/api',
  LOGIN_PAGE: './index.html',
  DASHBOARD_PAGE: './dashboard.html',
  // Admin is deployed under /admin on the same origin as the user frontend.
  USER_FRONTEND_URL: localStorage.getItem('userFrontendUrl') || '../dashboard.html',
};
