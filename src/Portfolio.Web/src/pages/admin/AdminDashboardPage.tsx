import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, getOpsReport, type OpsReport } from '../../api/apiClient';
import { clearAdminAuth, getAdminToken } from '../../auth/adminAuthStorage';
import { SiteHeader } from '../../components/layout/SiteHeader';
import './AdminPages.css';

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toISOString().replace('T', ' ').slice(0, 16);
}

export function AdminDashboardPage() {
  const [report, setReport] = useState<OpsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getOpsReport(token);
      setReport(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAdminAuth();
        window.location.href = '/admin/login';
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  function handleSignOut() {
    clearAdminAuth();
    window.location.href = '/admin/login';
  }

  return (
    <div className="admin-shell">
      <SiteHeader />
      <main className="admin-main admin-dashboard">
        <header className="admin-dashboard-header">
          <div>
            <p className="eyebrow">Operations</p>
            <h1>Traffic &amp; security report</h1>
            <p className="text-secondary">
              Conditional incident timeline and rolling {report?.retentionDays ?? 7}-day traffic summary.
            </p>
          </div>
          <div className="admin-actions">
            <button type="button" className="btn btn-secondary" onClick={() => void loadReport()} disabled={loading}>
              Refresh
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        {loading && <p className="text-secondary">Loading report…</p>}
        {error && <p className="admin-error">{error}</p>}

        {report && !loading && (
          <>
            <section className="card admin-section">
              <h2>Active incident timeline</h2>
              {report.incidents.length === 0 ? (
                <p className="text-secondary">No probe incidents in the retention window. Sightline clear.</p>
              ) : (
                <ul className="admin-incident-list">
                  {report.incidents.map((incident) => (
                    <li key={`${incident.timestamp}-${incident.resourcePath}`}>
                      <span className="admin-incident-time">
                        [{formatTimestamp(incident.timestamp)}]
                      </span>{' '}
                      <span className="admin-incident-flag">🛑</span>{' '}
                      {incident.summary}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card admin-section admin-summary-grid">
              <div>
                <h3>Total CV downloads (last {report.retentionDays} days)</h3>
                <p className="admin-stat">{report.totalCvDownloadsLast7Days}</p>
              </div>
              <div>
                <h3>Active traffic hotspots</h3>
                <p className="admin-stat admin-stat-small">
                  {report.activeTrafficHotspots.length > 0
                    ? report.activeTrafficHotspots.join(', ')
                    : 'No regional traffic recorded yet'}
                </p>
              </div>
              <div>
                <h3>System storage footprint</h3>
                <p className="admin-stat admin-stat-small">
                  {report.storageFootprintMb.toFixed(2)} MB (optimized via auto-purge policy)
                </p>
              </div>
            </section>
          </>
        )}

        <p className="admin-footnote text-muted">
          <Link to="/">Back to site</Link>
        </p>
      </main>
    </div>
  );
}
