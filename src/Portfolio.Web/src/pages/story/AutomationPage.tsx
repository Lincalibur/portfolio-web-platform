import { useEffect, useRef, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import { assetUrl } from '../../utils/assetUrl';
import { runAutomationSequence } from './automationRunner';
import {
  buildCommand,
  getDefaultParams,
  type ScriptInputDefinition,
  type TerminalLine,
} from './automationSimulators';
import './AutomationPage.css';

interface AutomationScriptEntry {
  id: string;
  filename: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  language: string;
  sourcePath: string;
  delayMs: number;
  inputs: ScriptInputDefinition[];
}

interface AutomationScriptsData {
  title: string;
  description: string;
  scripts: AutomationScriptEntry[];
}

function MatrixBackdrop() {
  const columns = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    delay: `${(index * 0.35).toFixed(2)}s`,
    duration: `${(2.8 + (index % 5) * 0.4).toFixed(2)}s`,
    left: `${(index * 5.5 + 1).toFixed(1)}%`,
  }));

  return (
    <div className="terminal__matrix" aria-hidden="true">
      {columns.map((column) => (
        <span
          key={column.id}
          className="terminal__matrix-column"
          style={{
            left: column.left,
            animationDelay: column.delay,
            animationDuration: column.duration,
          }}
        />
      ))}
    </div>
  );
}

export function AutomationPage() {
  const [data, setData] = useState<AutomationScriptsData | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sourceCode, setSourceCode] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [spinnerLine, setSpinnerLine] = useState<string | null>(null);
  const [finaleState, setFinaleState] = useState<'success' | 'failure' | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  const activeScript = data?.scripts.find((script) => script.id === activeId) ?? null;
  const runCommand = activeScript ? buildCommand(activeScript.id, params) : '';

  useEffect(() => {
    fetch(assetUrl('/fixtures/automation-scripts.json'))
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
      setParams({});
      return;
    }

    setParams(getDefaultParams(activeScript.inputs));
    setVisibleLines([]);
    setSpinnerLine(null);
    setFinaleState(null);

    fetch(assetUrl(activeScript.sourcePath))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load source');
        return res.text();
      })
      .then(setSourceCode)
      .catch(() => setSourceCode('// Source unavailable'));

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
  }, [visibleLines, spinnerLine]);

  function updateParam(id: string, value: string) {
    setParams((prev) => ({ ...prev, [id]: value }));
  }

  async function runScript() {
    if (!activeScript || running) {
      return;
    }

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setRunning(true);
    setVisibleLines([]);
    setSpinnerLine(null);
    setFinaleState(null);

    void logInteraction(
      'automation',
      'run_script',
      JSON.stringify({ scriptId: activeScript.id, params }),
      getToken(),
    );

    await runAutomationSequence({
      scriptId: activeScript.id,
      params,
      command: buildCommand(activeScript.id, params),
      baseDelayMs: activeScript.delayMs,
      onLinesChange: setVisibleLines,
      onSpinnerChange: setSpinnerLine,
      onFinaleChange: setFinaleState,
      isCancelled: () => runIdRef.current !== runId,
    });

    if (runIdRef.current === runId) {
      setRunning(false);
      setSpinnerLine(null);
    }
  }

  function resetTerminal() {
    runIdRef.current += 1;
    setVisibleLines([]);
    setSpinnerLine(null);
    setFinaleState(null);
    setRunning(false);
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!data || !activeScript) {
    return <p className="loading-text">Loading automation hub…</p>;
  }

  const terminalClassName = [
    'terminal',
    running ? 'terminal--running' : '',
    finaleState === 'success' ? 'terminal--finale-success' : '',
    finaleState === 'failure' ? 'terminal--finale-failure' : '',
  ]
    .filter(Boolean)
    .join(' ');

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

      <div className="automation-stack">
        <section className="automation-panel card">
          <div className="automation-panel__header">
            <h3>Run parameters</h3>
            <code>{runCommand}</code>
          </div>

          <div className="automation-params">
            {activeScript.inputs.map((input) => (
              <div key={input.id} className="form-group automation-param">
                <label className="form-label" htmlFor={`param-${input.id}`}>
                  {input.label}
                </label>
                {input.type === 'select' ? (
                  <select
                    id={`param-${input.id}`}
                    className="form-input"
                    value={params[input.id] ?? input.default}
                    onChange={(e) => updateParam(input.id, e.target.value)}
                    disabled={running}
                  >
                    {input.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`param-${input.id}`}
                    className="form-input"
                    type="text"
                    value={params[input.id] ?? input.default}
                    placeholder={input.placeholder}
                    onChange={(e) => updateParam(input.id, e.target.value)}
                    disabled={running}
                  />
                )}
              </div>
            ))}
          </div>

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
              disabled={running && visibleLines.length === 0}
            >
              Clear output
            </button>
          </div>
        </section>

        <section className="automation-panel card">
          <div className="automation-panel__header">
            <h3>Output</h3>
            <span className="automation-panel__hint">Live console show — run first, review code below</span>
          </div>

          <div className={terminalClassName} ref={terminalRef} role="log" aria-live="polite">
            {running && <MatrixBackdrop />}

            <div className="terminal__content">
              {visibleLines.length === 0 && !spinnerLine ? (
                <p className="terminal__placeholder">
                  Hit Run script to see the demo output — ASCII banners, progress bars, and rocket launch finales.
                </p>
              ) : (
                visibleLines.map((line, index) => (
                  <div
                    key={`${line.id ?? 'line'}-${index}`}
                    className={[
                      'terminal__line',
                      `terminal__line--${line.tone ?? 'default'}`,
                      line.meta ? `terminal__line--${line.meta}` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {line.text || '\u00A0'}
                  </div>
                ))
              )}

              {spinnerLine && (
                <div className="terminal__line terminal__line--info terminal__line--spinner">
                  {spinnerLine}
                </div>
              )}

              {running && !spinnerLine && (
                <span className="terminal__cursor" aria-hidden="true">
                  ▊
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="automation-panel card automation-panel--source">
          <div className="automation-panel__header">
            <h3>Source code</h3>
            <code>{activeScript.filename}</code>
          </div>
          <p className="automation-source-hint">Optional — review the script after watching the output above.</p>
          <pre className="automation-code__pre">
            <code>{sourceCode}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
