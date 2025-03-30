import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@arco-design/web-react/dist/css/arco.css';
import './index.css';
import { fixReact19RefWarning } from './utils/react19Compat';

// 应用 React 19 兼容性修复
fixReact19RefWarning();

// 挂载 React 应用到 DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
