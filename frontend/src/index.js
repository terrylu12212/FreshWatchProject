import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ensureAuthOrRedirect } from './utils/auth';

// Patch global fetch to auto-redirect on 401/403
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const res = await originalFetch(...args);
    if (res.status === 401 || res.status === 403) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return res;
    }
    return res;
  } catch (e) {
    throw e;
  }
};

// Optional: check auth on initial load for protected locations
const publicPaths = ['/login', '/signup'];
if (!publicPaths.includes(window.location.pathname)) {
  ensureAuthOrRedirect();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

