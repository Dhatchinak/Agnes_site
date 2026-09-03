import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SecretHeartAdmin from './components/SecretHeartAdmin';
import './styles.css';

const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
const params = new URLSearchParams(window.location.search);
const isSecretAdmin = cleanPath.endsWith('/secret-admin') || params.has('secret-admin');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isSecretAdmin ? <SecretHeartAdmin /> : <App />}
  </React.StrictMode>
);
