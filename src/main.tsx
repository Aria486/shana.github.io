import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './i18n';   // 初始化 i18next

const container = document.getElementById('root');
if (!container) throw new Error('No root element found');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
