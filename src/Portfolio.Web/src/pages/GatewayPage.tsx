import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, logInteraction, requestAccess } from '../api/apiClient';
import { setPendingEmail } from '../auth/authStorage';
import { SiteHeader } from '../components/layout/SiteHeader';
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const result = await requestAccess({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || undefined,
      });

      setPendingEmail(email.trim().toLowerCase());
      setSuccessMessage(result.message);
      navigate('/gateway/verify');
    } catch (error) {
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
      <SiteHeader>
        <Link to="/" className="btn btn-ghost">
          Back home
        </Link>
      </SiteHeader>

      <main className="container gateway-main">
        <div className="gateway-card card">
          <div className="gateway-card__header">
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTNubHBxMjV2cGR1NDZ3dHJqMTY5a3RoYXFvMTE4OWdtY29hbnF5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ip5L71rU6sjcc/giphy.gif" alt="Gateway" style={{ width: '100%', borderRadius: '8px', marginBottom: '1.5rem', display: 'block' }} />
            <span className="badge badge-muted">Block 01</span>
            <h1>Gateway</h1>
            <p>Verify your identity to access the interactive resume story.</p>
          </div>

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
              {submitting ? 'Sending code…' : 'Send verification code'}
            </button>
          </form>

          <p className="gateway-hint">
            In development, the OTP appears in the API console when SMTP is not configured.
          </p>
        </div>
      </main>
    </div>
  );
}
