import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const html = document.documentElement;
const initialLoader = document.getElementById('initial-loader');

const revealApp = () => {
  html.classList.remove('toolscout-loading');
  html.classList.add('app-ready');

  window.setTimeout(() => {
    initialLoader?.remove();
  }, 450);
};

const fontReady =
  'fonts' in document
    ? (document as Document & { fonts: FontFaceSet }).fonts.ready
    : Promise.resolve();

Promise.race([
  fontReady,
  new Promise((resolve) => window.setTimeout(resolve, 1200)),
])
  .then(revealApp)
  .catch(revealApp);
