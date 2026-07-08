import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth/authStorage';
import { isAdminAuthenticated } from '../auth/adminAuthStorage';

export function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/gateway" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminProtectedRoute() {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/story" replace />;
  }

  return <Outlet />;
}
