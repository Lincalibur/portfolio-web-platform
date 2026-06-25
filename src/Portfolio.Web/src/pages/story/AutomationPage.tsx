import { useEffect, useRef, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './AutomationPage.css';

interface AutomationScript {
  title: string;
  description: string;
  command: string;
  lines: string[];
  delayMs: number;
}

export function AutomationPage() {
  const [script, setScript] = useState<AutomationScript | null>(null);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/fixtures/automation-parse-logs.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load automation fixture');
        return res.json() as Promise<AutomationScript>;
      })
      .then(setScript)
      .catch(() => setError('Could not load automation script.'));

    void logInteraction('automation', 'view', null, getToken());
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  async function runScript() {
    if (!script || running) return;

    setRunning(true);
    setVisibleLines([`$ ${script.command}`]);
    void logInteraction('automation', 'run_script', JSON.stringify({ script: script.title }), getToken());

    for (const line of script.lines) {
      await new Promise((resolve) => setTimeout(resolve, script.delayMs));
      setVisibleLines((prev) => [...prev, line]);
    }

    setRunning(false);
  }

  function resetTerminal() {
    setVisibleLines([]);
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!script) {
    return <p className="loading-text">Loading automation hub…</p>;
  }

  return (
    <div className="automation-page">
      <header className="block-header">
        <span className="badge badge-muted">Block 04</span>
        <h1>{script.title}</h1>
        <p>{script.description}</p>
      </header>

      <div className="automation-controls">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void runScript()}
          disabled={running}
        >
          {running ? 'Running…' : 'Run script'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={resetTerminal}
          disabled={running || visibleLines.length === 0}
        >
          Clear
        </button>
      </div>

      <div className="terminal card" ref={terminalRef} role="log" aria-live="polite">
        {visibleLines.length === 0 ? (
          <p className="terminal__placeholder">Press Run script to start the demo.</p>
        ) : (
          visibleLines.map((line, index) => (
            <div key={`${index}-${line}`} className="terminal__line">
              {line}
            </div>
          ))
        )}
        {running && <span className="terminal__cursor" aria-hidden="true">▊</span>}
      </div>
    </div>
  );
}
