import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { TrafficBeacon } from '../components/TrafficBeacon';
import { LandingPage } from '../pages/LandingPage';
import { GatewayPage } from '../pages/GatewayPage';
import { VerifyPage } from '../pages/VerifyPage';
import { StoryLayout } from '../components/layout/StoryLayout';
import { StoryHomePage } from '../pages/story/StoryHomePage';
import { PipelinePage } from '../pages/story/PipelinePage';
import { OrchestrationPage } from '../pages/story/OrchestrationPage';
import { AutomationPage } from '../pages/story/AutomationPage';
import { GuestRoute, AdminProtectedRoute, ProtectedRoute } from './ProtectedRoute';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const router = createBrowserRouter([
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
    element: <LandingPage />,
  },
  {
    element: <GuestRoute />,
    children: [
      { path: '/gateway', element: <GatewayPage /> },
      { path: '/gateway/verify', element: <VerifyPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/story',
        element: <StoryLayout />,
        children: [
          { index: true, element: <StoryHomePage /> },
          { path: 'pipeline', element: <PipelinePage /> },
          { path: 'orchestration', element: <OrchestrationPage /> },
          { path: 'automation', element: <AutomationPage /> },
        ],
      },
    ],
  },
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
]);
