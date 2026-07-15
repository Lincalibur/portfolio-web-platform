import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MatrixBackground } from './components/effects/MatrixBackground';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MatrixBackground />
    <div className="crt-overlay" aria-hidden="true" />
    <div className="app-shell">
      <RouterProvider router={router} />
    </div>
  </StrictMode>,
);
