import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminLogin, ApiError } from '../../api/apiClient';
import { isAdminAuthenticated, setAdminSession } from '../../auth/adminAuthStorage';
import { SiteHeader } from '../../components/layout/SiteHeader';
import './AdminPages.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const session = await adminLogin({ username: username.trim(), password });
      setAdminSession(session);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError('Admin portal is not configured on the API. Set credentials via user secrets.');
      } else if (err instanceof ApiError && err.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <SiteHeader />
      <main className="admin-main">
        <section className="card admin-card">
          <p className="eyebrow">Operations</p>
          <h1>Admin portal</h1>
          <p className="text-secondary">
            Restricted access for traffic and security incident reporting.
          </p>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && <p className="admin-error">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
