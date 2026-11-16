import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { Vision } from './App';
import './styles.css';

const visionOnly = import.meta.env.VITE_VISION_ONLY === 'true';

if (!visionOnly && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener(
    'load',
    () => void navigator.serviceWorker.register('/service-worker.js'),
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{visionOnly ? <Vision standalone /> : <App />}</React.StrictMode>,
);
