import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function isTokenExpired(token) {
  try {
    const { exp } = JSON.parse(window.atob(token.split('.')[1]));
    return Date.now() >= exp * 1000;
  } catch (e) {
    return false;
  }
}

axios.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    window.location.href = '/login';
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
