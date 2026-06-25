import { useEffect, useRef, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './AutomationPage.css';

type LineTone = 'default' | 'info' | 'success' | 'warn' | 'error';

interface TerminalLine {
  text: string;
  tone?: LineTone;
}

interface AutomationScriptEntry {
  id: string;
  filename: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  language: string;
  sourcePath: string;
  command: string;
  delayMs: number;
  lines: TerminalLine[];
}

interface AutomationScriptsData {
  title: string;
  description: string;
  scripts: AutomationScriptEntry[];
}

export function AutomationPage() {
  const [data, setData] = useState<AutomationScriptsData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sourceCode, setSourceCode] = useState('');
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const activeScript = data?.scripts.find((script) => script.id === activeId) ?? null;

  useEffect(() => {
    fetch('/fixtures/automation-scripts.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load automation scripts');
        return res.json() as Promise<AutomationScriptsData>;
      })
      .then((fixture) => {
        setData(fixture);
        setActiveId(fixture.scripts[0]?.id ?? null);
      })
      .catch(() => setError('Could not load automation scripts.'));

    void logInteraction('automation', 'view', null, getToken());
  }, []);

  useEffect(() => {
    if (!activeScript) {
      setSourceCode('');
      return;
    }

    fetch(activeScript.sourcePath)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load source');
        return res.text();
      })
      .then(setSourceCode)
      .catch(() => setSourceCode('// Source unavailable'));

    setVisibleLines([]);
    void logInteraction(
      'automation',
      'select_script',
      JSON.stringify({ scriptId: activeScript.id }),
      getToken(),
    );
  }, [activeScript]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  async function runScript() {
    if (!activeScript || running) {
      return;
    }

    setRunning(true);
    setVisibleLines([{ text: `$ ${activeScript.command}`, tone: 'info' }]);
    void logInteraction(
      'automation',
      'run_script',
      JSON.stringify({ scriptId: activeScript.id }),
      getToken(),
    );

    for (const line of activeScript.lines) {
      await new Promise((resolve) => window.setTimeout(resolve, activeScript.delayMs));
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

  if (!data || !activeScript) {
    return <p className="loading-text">Loading automation hub…</p>;
  }

  return (
    <div className="automation-page">
      <header className="block-header">
        <span className="badge badge-muted">Block 04</span>
        <h1>{data.title}</h1>
        <p>{data.description}</p>
      </header>

      <div className="automation-tabs" role="tablist" aria-label="Script repository">
        {data.scripts.map((script) => (
          <button
            key={script.id}
            type="button"
            role="tab"
            aria-selected={script.id === activeId}
            className={`automation-tab${script.id === activeId ? ' automation-tab--active' : ''}`}
            onClick={() => setActiveId(script.id)}
          >
            {script.filename}
          </button>
        ))}
      </div>

      <div className="automation-detail card">
        <div className="automation-detail__header">
          <div>
            <h2>{activeScript.title}</h2>
            <p className="automation-detail__tagline">{activeScript.tagline}</p>
          </div>
          <span className="badge badge-muted">{activeScript.language}</span>
        </div>

        <p className="automation-detail__description">{activeScript.description}</p>

        <ul className="automation-highlights">
          {activeScript.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>

      <div className="automation-workspace">
        <section className="automation-code card">
          <div className="automation-panel__header">
            <h3>Source</h3>
            <code>{activeScript.filename}</code>
          </div>
          <pre className="automation-code__pre">
            <code>{sourceCode}</code>
          </pre>
        </section>

        <section className="automation-terminal-wrap">
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
              <p className="terminal__placeholder">Press Run script to simulate output.</p>
            ) : (
              visibleLines.map((line, index) => (
                <div
                  key={`${index}-${line.text}`}
                  className={`terminal__line terminal__line--${line.tone ?? 'default'}`}
                >
                  {line.text || '\u00A0'}
                </div>
              ))
            )}
            {running && (
              <span className="terminal__cursor" aria-hidden="true">
                ▊
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
