// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Строгий режим без ошибок типизации
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);