import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth/authStorage';

export function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/gateway" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/story" replace />;
  }

  return <Outlet />;
}
