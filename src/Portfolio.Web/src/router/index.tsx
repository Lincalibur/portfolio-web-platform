import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { TrafficBeacon } from '../components/TrafficBeacon';
import { PortfolioPage } from '../pages/PortfolioPage';
import { AdminProtectedRoute } from './ProtectedRoute';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

/** Vite BASE_URL ends with `/`; React Router basename must not (except `/`). */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      element: (
        <>
          <TrafficBeacon />
          <Outlet />
        </>
      ),
      children: [
        {
          path: '/',
          element: <PortfolioPage />,
        },
        // Legacy gated routes → open scroll portfolio
        { path: '/gateway', element: <Navigate to="/" replace /> },
        { path: '/gateway/verify', element: <Navigate to="/" replace /> },
        { path: '/story', element: <Navigate to="/#overview" replace /> },
        { path: '/story/pipeline', element: <Navigate to="/#pipeline" replace /> },
        { path: '/story/orchestration', element: <Navigate to="/#security" replace /> },
        { path: '/story/automation', element: <Navigate to="/#automation" replace /> },
        { path: '/story/contact', element: <Navigate to="/#contact" replace /> },
        {
          element: <AdminProtectedRoute />,
          children: [
            { path: '/admin', element: <AdminDashboardPage /> },
          ],
        },
        { path: '/admin/login', element: <AdminLoginPage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
