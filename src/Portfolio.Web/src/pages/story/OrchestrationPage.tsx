import { useCallback, useEffect, useState } from 'react';
import {
  getHostStats,
  logInteraction,
  USE_HOST_STATS_API,
  type HostStats,
} from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './OrchestrationPage.css';

export function OrchestrationPage() {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getHostStats(getToken());
      setStats(result);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load host statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    void logInteraction('orchestration', 'view', null, getToken());
  }, [loadStats]);

  const memoryPercent = stats
    ? Math.round((stats.memoryUsedMb / stats.memoryTotalMb) * 100)
    : 0;

  return (
    <div className="orchestration-page">
      <header className="block-header orchestration-header">
        <div>
          <span className="badge badge-muted">Block 03</span>
          <h1>System Orchestration</h1>
          <p>
            {USE_HOST_STATS_API
              ? 'Live metrics from the protected host stats API.'
              : 'Preview metrics from fixture data until Features:HostStats is enabled.'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void loadStats()}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          <div className="orchestration-metrics">
            <article className="metric-card card">
              <h2>CPU</h2>
              <div className="metric-value">{stats.cpuPercent.toFixed(1)}%</div>
              <div className="metric-bar">
                <div
                  className="metric-bar__fill metric-bar__fill--cpu"
                  style={{ width: `${Math.min(stats.cpuPercent, 100)}%` }}
                />
              </div>
            </article>

            <article className="metric-card card">
              <h2>Memory</h2>
              <div className="metric-value">
                {stats.memoryUsedMb.toFixed(0)} / {stats.memoryTotalMb.toFixed(0)} MB
              </div>
              <div className="metric-bar">
                <div
                  className="metric-bar__fill metric-bar__fill--memory"
                  style={{ width: `${memoryPercent}%` }}
                />
              </div>
              <p className="metric-sub">{memoryPercent}% utilized</p>
            </article>
          </div>

          <section className="card containers-section">
            <h2>Container status</h2>
            <ul className="container-list">
              {stats.containerStatuses.map((status) => (
                <li key={status} className="container-list__item">
                  <span className="status-dot status-dot--healthy" aria-hidden="true" />
                  <code>{status}</code>
                </li>
              ))}
            </ul>
          </section>

          {lastRefresh && (
            <p className="orchestration-footer">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
