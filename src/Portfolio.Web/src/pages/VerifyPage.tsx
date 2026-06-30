import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, logInteraction, verifyOtp } from '../api/apiClient';
import {
  clearPendingEmail,
  getPendingEmail,
  setSession,
} from '../auth/authStorage';
import { SiteHeader } from '../components/layout/SiteHeader';
import './VerifyPage.css';

export function VerifyPage() {
  const navigate = useNavigate();
  const [email] = useState(() => getPendingEmail() ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/gateway', { replace: true });
    }
  }, [email, navigate]);

  async function submitVerification(verificationCode: string) {
    if (submitting) {
      return;
    }

    setError(null);

    if (!email.trim() || !verificationCode.trim()) {
      setError('Email and verification code are required.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await verifyOtp({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });

      setSession({
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
      });

      void logInteraction('gateway', 'verify_success', null, result.accessToken);
      clearPendingEmail();
      navigate('/story', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid or expired code. Request a new one from the gateway.');
      } else {
        setError('Verification failed. Please try again.');
      }
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await submitVerification(code);
  }

  function handleCodeChange(nextCode: string) {
    const normalized = nextCode.replace(/\D/g, '').slice(0, 6);
    setCode(normalized);

    if (normalized.length === 6) {
      void submitVerification(normalized);
    }
  }

  return (
    <div className="page verify-page">
      <SiteHeader>
        <Link to="/gateway" className="btn btn-ghost">
          Back
        </Link>
      </SiteHeader>

      <main className="container verify-main">
        <div className="verify-card card">
          <span className="badge badge-muted">Block 01</span>
          <h1>Enter verification code</h1>
          <p className="verify-lead">
            We sent a one-time code to <strong>{email}</strong>.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="code">
                6-digit code
              </label>
              <input
                id="code"
                className="form-input verify-code-input"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                disabled={submitting}
              />
            </div>

            <button type="submit" className="btn btn-primary verify-submit" disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify and continue'}
            </button>
          </form>

          <p className="verify-footer">
            Did not receive a code?{' '}
            <Link to="/gateway">Request access again</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
