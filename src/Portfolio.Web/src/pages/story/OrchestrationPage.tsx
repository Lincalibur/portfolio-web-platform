import { useEffect, useRef, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './OrchestrationPage.css';

type AttackPhase = 'idle' | 'traveling' | 'blocked' | 'done';

interface SecurityLogEntry {
  time: string;
  level: 'info' | 'warn' | 'block';
  message: string;
}

function formatTime(): string {
  return new Date().toISOString().replace('T', ' ').slice(11, 19);
}

export function OrchestrationPage() {
  const [attackPhase, setAttackPhase] = useState<AttackPhase>('idle');
  const [securityFlash, setSecurityFlash] = useState(false);
  const [logs, setLogs] = useState<SecurityLogEntry[]>([
    {
      time: formatTime(),
      level: 'info',
      message: 'Gateway online — token validation and rate limiting active.',
    },
  ]);
  const attackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    void logInteraction('orchestration', 'view', null, getToken());
    return () => {
      if (attackTimerRef.current) {
        window.clearTimeout(attackTimerRef.current);
      }
    };
  }, []);

  function appendLog(level: SecurityLogEntry['level'], message: string) {
    setLogs((prev) => [...prev, { time: formatTime(), level, message }]);
  }

  function simulateAttack() {
    if (attackPhase === 'traveling' || attackPhase === 'blocked') {
      return;
    }

    setAttackPhase('traveling');
    appendLog('warn', 'Inbound request detected: suspicious SQL injection pattern in query string.');
    void logInteraction('orchestration', 'simulate_attack', null, getToken());

    attackTimerRef.current = window.setTimeout(() => {
      setSecurityFlash(true);
      setAttackPhase('blocked');

      attackTimerRef.current = window.setTimeout(() => {
        setSecurityFlash(false);
        setAttackPhase('done');
        appendLog(
          'block',
          '403 Forbidden — Rate limit / payload filter triggered. Malicious packet dropped at API hardening layer.',
        );

        attackTimerRef.current = window.setTimeout(() => {
          setAttackPhase('idle');
        }, 2500);
      }, 700);
    }, 1400);
  }

  return (
    <div className="gateway-page">
      <header className="block-header gateway-header">
        <div>
          <span className="badge badge-muted">Block 03</span>
          <h1>API Gateway &amp; Security</h1>
          <p>
            Visual circuit showing how client traffic is validated, rate-limited, and routed to healthy
            microservices — with a live attack simulation.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary gateway-attack-btn"
          onClick={simulateAttack}
          disabled={attackPhase === 'traveling' || attackPhase === 'blocked'}
        >
          Simulate SQL Injection / API Abuse
        </button>
      </header>

      <section className="gateway-circuit card">
        <div className="gateway-column">
          <h2>Client Request</h2>
          <div className="gateway-node">
            <p>Web Traffic</p>
            <span className="gateway-node__status gateway-node__status--ok">Normal flow</span>
          </div>
          <div className="gateway-node gateway-node--threat">
            <p>Malicious Payload 🛑</p>
            <span className="gateway-node__status gateway-node__status--danger">Blocked path</span>
          </div>
        </div>

        <div className="gateway-flow" aria-hidden="true">
          <div className={`gateway-flow__track${attackPhase !== 'idle' && attackPhase !== 'done' ? ' gateway-flow__track--active' : ''}`}>
            {(attackPhase === 'traveling' || attackPhase === 'blocked') && (
              <span className={`gateway-packet${attackPhase === 'blocked' ? ' gateway-packet--blocked' : ''}`} />
            )}
          </div>
          <span className="gateway-flow__arrow">→</span>
        </div>

        <div className={`gateway-column gateway-column--security${securityFlash ? ' gateway-column--flash' : ''}`}>
          <h2>Security Layer</h2>
          <div className="gateway-node">
            <p>API Hardening</p>
            <span className="gateway-node__status gateway-node__status--ok">Token validation</span>
          </div>
          <div className="gateway-node">
            <p>Rate Limiter 🛡️</p>
            <span className="gateway-node__status gateway-node__status--shield">Payload filter</span>
          </div>
        </div>

        <div className="gateway-flow" aria-hidden="true">
          <span className="gateway-flow__arrow">→</span>
        </div>

        <div className="gateway-column">
          <h2>Microservices</h2>
          <div className="gateway-node">
            <p>web</p>
            <span className="gateway-node__status gateway-node__status--ok">Healthy</span>
          </div>
          <div className="gateway-node">
            <p>api</p>
            <span className="gateway-node__status gateway-node__status--ok">Healthy</span>
          </div>
        </div>
      </section>

      <section className="gateway-log card">
        <h2>Security event log</h2>
        <div className="gateway-log__panel" role="log" aria-live="polite">
          {logs.map((entry, index) => (
            <div key={`${entry.time}-${index}`} className={`gateway-log__line gateway-log__line--${entry.level}`}>
              <span className="gateway-log__time">[{entry.time}]</span> {entry.message}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
