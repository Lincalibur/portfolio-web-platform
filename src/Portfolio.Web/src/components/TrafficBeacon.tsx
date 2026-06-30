import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '../api/trafficBeacon';

export function TrafficBeacon() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const isPublicRoute =
      path === '/' ||
      path.startsWith('/gateway') ||
      path.startsWith('/story');

    if (!isPublicRoute) {
      return;
    }

    void recordPageView('PageView');
  }, [location.pathname]);

  return null;
}
