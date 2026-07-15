const BEACON_KEY = 'portfolio.trafficBeacon';
const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';

export async function recordPageView(metricType: 'PageView' | 'CvDownload' = 'PageView'): Promise<void> {
  if (STATIC_DEMO) {
    return;
  }

  const sessionKey = `${BEACON_KEY}:${metricType}:${window.location.pathname}`;
  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  try {
    const response = await fetch('/api/metrics/traffic/pageview', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metricType }),
    });

    if (response.ok || response.status === 204) {
      sessionStorage.setItem(sessionKey, new Date().toISOString());
    }
  } catch {
    // Traffic beacons are best-effort and should never block the UI.
  }
}
