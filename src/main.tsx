import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AdminApp } from './admin/AdminApp';

const RootApp = window.location.pathname.startsWith('/admin') ? AdminApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
