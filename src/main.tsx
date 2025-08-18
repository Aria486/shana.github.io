import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

import './i18n';   // 初始化 i18next

const container = document.getElementById('root');
if (!container) throw new Error('No root element found');

createRoot(container).render(
  <React.StrictMode>
    <Router basename="/shana.github.io">
      <App />
    </Router>
  </React.StrictMode>
);
