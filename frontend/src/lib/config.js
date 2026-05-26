// Configuration for dynamic backend URL selection
export const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://notecraft-backend-vpad.onrender.com';
