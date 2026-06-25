import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { GatewayPage } from '../pages/GatewayPage';
import { VerifyPage } from '../pages/VerifyPage';
import { StoryLayout } from '../components/layout/StoryLayout';
import { StoryHomePage } from '../pages/story/StoryHomePage';
import { PipelinePage } from '../pages/story/PipelinePage';
import { OrchestrationPage } from '../pages/story/OrchestrationPage';
import { AutomationPage } from '../pages/story/AutomationPage';
import { DocsPage } from '../pages/story/DocsPage';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
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
          { path: 'docs', element: <DocsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
