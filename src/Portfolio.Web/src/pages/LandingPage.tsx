import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../api/apiClient';
import { SiteHeader } from '../components/layout/SiteHeader';
import './LandingPage.css';

type HealthState = 'loading' | 'healthy' | 'error';

export function LandingPage() {
  const [healthState, setHealthState] = useState<HealthState>('loading');
  const [healthMessage, setHealthMessage] = useState('Checking API…');

  useEffect(() => {
    let cancelled = false;

    getHealth()
      .then((result) => {
        if (cancelled) return;
        setHealthState(result.status === 'healthy' ? 'healthy' : 'error');
        setHealthMessage(`API status: ${result.status}`);
      })
      .catch(() => {
        if (cancelled) return;
        setHealthState('error');
        setHealthMessage('Unable to reach the API. Start Portfolio.Api (`dotnet run` in src/Portfolio.Api), then restart the Vite dev server.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page landing-page">
      <SiteHeader>
        <Link to="/gateway" className="btn btn-primary">
          Request access
        </Link>
      </SiteHeader>

      <main className="landing-hero container">
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">Bachelor of Computing · Fintech (C#) · API Security</p>
          <h1>Interactive Resume Ecosystem</h1>
          <p className="landing-hero__lead">
            Liam Olivier — software developer with a newly earned <strong>Bachelor of Computing</strong>,
            focused on <strong>Fintech solutions in C#</strong> and hands-on experience building{' '}
            <strong>API security tooling</strong>. Explore a gated portfolio that demonstrates secure
            gateways, CI/CD pipelines, and live security simulations.
          </p>

          <ul className="landing-credentials">
            <li>🎓 Bachelor of Computing</li>
            <li>💳 Fintech &amp; enterprise C# development</li>
            <li>🛡️ API hardening, rate limiting &amp; payload filtering</li>
          </ul>

          <div className="landing-hero__actions">
            <Link to="/gateway" className="btn btn-primary">
              Enter the gateway
            </Link>
            <a
              href="https://www.github.com/lincalibur"
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              View GitHub
            </a>
          </div>

          <div className="landing-health card">
            <div className="landing-health__row">
              <span
                className={`status-dot status-dot--${healthState === 'healthy' ? 'healthy' : 'unknown'}`}
                aria-hidden="true"
              />
              <span>{healthMessage}</span>
            </div>
          </div>
        </div>

        <div className="landing-blocks">
          {[
            { num: '01', title: 'Gateway', desc: 'Email OTP and JWT gatekeeper' },
            { num: '02', title: 'Deploy Pipeline', desc: 'CI/CD flow with sanitized YAML snippets' },
            { num: '03', title: 'API Security', desc: 'Interactive gateway circuit & attack simulation' },
            { num: '04', title: 'Automation', desc: 'Script repository with live console demos' },
          ].map((block) => (
            <article key={block.num} className="landing-block card">
              <span className="landing-block__num">{block.num}</span>
              <h3>{block.title}</h3>
              <p>{block.desc}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
