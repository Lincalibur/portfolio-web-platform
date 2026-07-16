import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, logInteraction, requestAccess } from '../api/apiClient';
import { setPendingEmail } from '../auth/authStorage';
import { GatewaySqlBlockModal } from '../components/gateway/GatewaySqlBlockModal';
import { SiteHeader } from '../components/layout/SiteHeader';
import { findSqlInjectionField } from '../utils/detectSqlInjection';
import './GatewayPage.css';

interface FormErrors {
  fullName?: string;
  email?: string;
  company?: string;
  general?: string;
}

export function GatewayPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [handshakeLog, setHandshakeLog] = useState<string[]>([]);
  const [sqlBlockOpen, setSqlBlockOpen] = useState(false);
  const [sqlBlockField, setSqlBlockField] = useState<string | undefined>();

  useEffect(() => {
    void logInteraction('gateway', 'view', null, null);
  }, []);

  function validateClient(): FormErrors {
    const next: FormErrors = {};

    if (!fullName.trim()) {
      next.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    return next;
  }

  function handleSqlInjectionBlocked(fieldLabel: string, fieldKey: string) {
    setSqlBlockField(fieldLabel);
    setSqlBlockOpen(true);
    setSubmitting(false);
    void logInteraction(
      'gateway',
      'sql_injection_blocked',
      JSON.stringify({ field: fieldKey }),
      null,
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);

    const injection = findSqlInjectionField({
      fullName,
      email,
      company,
    });

    if (injection) {
      handleSqlInjectionBlocked(injection.label, injection.field);
      return;
    }

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setHandshakeLog([
      '[OK] Validating payload integrity…',
      '[OK] Initiating handshake…',
    ]);

    try {
      const result = await requestAccess({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || undefined,
      });

      setPendingEmail(email.trim().toLowerCase());
      setHandshakeLog((prev) => [
        ...prev,
        `[OK] Dispatching OTP vector to ${email.trim().toLowerCase()}…`,
        '[OK] Awaiting verification code…',
      ]);
      setSuccessMessage(result.message);
      window.setTimeout(() => {
        navigate('/gateway/verify');
      }, 650);
    } catch (error) {
      setHandshakeLog((prev) => [...prev, '[!!] Handshake aborted.']);
      if (error instanceof ApiError) {
        if (error.validationErrors) {
          setErrors({
            fullName: error.validationErrors.FullName?.[0] ?? error.validationErrors.fullName?.[0],
            email: error.validationErrors.Email?.[0] ?? error.validationErrors.email?.[0],
            company: error.validationErrors.Company?.[0] ?? error.validationErrors.company?.[0],
          });
        } else {
          setErrors({ general: 'Unable to process your request. Please try again.' });
        }
      } else {
        setErrors({ general: 'Network error. Check that the API is running.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page gateway-page">
      <GatewaySqlBlockModal
        open={sqlBlockOpen}
        fieldLabel={sqlBlockField}
        onClose={() => setSqlBlockOpen(false)}
      />

      <SiteHeader>
        <Link to="/" className="btn btn-ghost">
          Back home
        </Link>
      </SiteHeader>

      <main className="container gateway-main">
        <div className="gateway-card card">
          <div className="gateway-card__header">
            <span className="badge badge-muted">BLK_01 // GATE</span>
            <h1>GATEWAY</h1>
            <p>Authenticate to unlock the interactive resume story blocks.</p>
          </div>

          {handshakeLog.length > 0 && (
            <div className="gateway-handshake" aria-live="polite">
              {handshakeLog.map((line, index) => (
                <span
                  key={`${index}-${line}`}
                  className={`gateway-handshake__line${line.startsWith('[!!]') ? ' gateway-handshake__line--dim' : ''}`}
                >
                  {line}
                </span>
              ))}
            </div>
          )}

          {errors.general && <div className="alert alert-error">{errors.general}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className={`form-input${errors.fullName ? ' input-error' : ''}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                disabled={submitting}
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                className={`form-input${errors.email ? ' input-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="company">
                Company <span className="form-optional">(optional)</span>
              </label>
              <input
                id="company"
                className={`form-input${errors.company ? ' input-error' : ''}`}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
                disabled={submitting}
              />
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            <button type="submit" className="btn btn-primary gateway-submit" disabled={submitting}>
              {submitting ? 'Initiating handshake…' : 'Dispatch OTP vector'}
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
