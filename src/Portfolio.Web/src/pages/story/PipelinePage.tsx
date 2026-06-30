import { useEffect, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './PipelinePage.css';

interface PipelineNode {
  id: string;
  label: string;
  status: 'success' | 'running' | 'pending' | 'failed';
}

interface PipelineData {
  title: string;
  playSequence?: string[];
  nodes: PipelineNode[];
  yamlSnippets: Record<string, string>;
}

const PLAY_DURATION_MS = 7200;

const statusBadge: Record<PipelineNode['status'], string> = {
  success: 'badge-success',
  running: 'badge-warning',
  pending: 'badge-muted',
  failed: 'badge-warning',
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [completedPlayIds, setCompletedPlayIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/fixtures/pipeline.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load pipeline fixture');
        return res.json() as Promise<PipelineData>;
      })
      .then((fixture) => {
        setData(fixture);
        setSelectedId(fixture.nodes[0]?.id ?? null);
      })
      .catch(() => setError('Could not load pipeline data.'));

    void logInteraction('pipeline', 'view', null, getToken());
  }, []);

  function handleNodeClick(nodeId: string) {
    if (playing) return;
    setSelectedId(nodeId);
    void logInteraction('pipeline', 'node_click', JSON.stringify({ nodeId }), getToken());
  }

  async function playPipeline() {
    if (!data || playing) return;

    const sequence =
      data.playSequence && data.playSequence.length > 0
        ? data.playSequence
        : data.nodes.map((node) => node.id);
    const stepMs = PLAY_DURATION_MS / sequence.length;

    setPlaying(true);
    setCompletedPlayIds(new Set());
    setActivePlayId(null);
    void logInteraction('pipeline', 'play', JSON.stringify({ sequence }), getToken());

    for (const nodeId of sequence) {
      setActivePlayId(nodeId);
      setSelectedId(nodeId);
      await sleep(stepMs);
      setCompletedPlayIds((prev) => new Set([...prev, nodeId]));
    }

    setActivePlayId(null);
    setPlaying(false);
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!data) {
    return <p className="loading-text">Loading pipeline…</p>;
  }

  const selectedYaml = selectedId ? data.yamlSnippets[selectedId] : null;
  const selectedNode = data.nodes.find((n) => n.id === selectedId);

  return (
    <div className="pipeline-page">
      <header className="block-header">
        <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGlyZW1xOHFxZmx1Z3FmN3B4dXdocmhrYTFxOHRjN3JoM3B0dThvMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6xE1FNcorRInS/giphy.gif" alt="Pipeline" style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', display: 'block' }} />
        <span className="badge badge-muted">Block 02</span>
        <h1>{data.title}</h1>
        <p>Run a simulated build or click a stage to inspect generic CI/CD YAML.</p>
      </header>

      <div className="pipeline-layout">
        <div className="pipeline-graph card">
          <div className="pipeline-graph__toolbar">
            <h2>Pipeline stages</h2>
            <button
              type="button"
              className="btn btn-primary pipeline-play-btn"
              onClick={() => void playPipeline()}
              disabled={playing}
              aria-label="Play pipeline simulation"
            >
              {playing ? '▶ Running…' : '▶ Play'}
            </button>
          </div>

          <div className="pipeline-nodes">
            {data.nodes.map((node, index) => {
              const isActive = activePlayId === node.id;
              const isCompleted = completedPlayIds.has(node.id);

              return (
                <div key={node.id} className="pipeline-node-wrapper">
                  {index > 0 && (
                    <div
                      className={`pipeline-connector${isCompleted || isActive ? ' pipeline-connector--live' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    className={[
                      'pipeline-node',
                      selectedId === node.id ? 'pipeline-node--selected' : '',
                      isActive ? 'pipeline-node--playing' : '',
                      isCompleted ? 'pipeline-node--completed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleNodeClick(node.id)}
                    disabled={playing && !isActive && !isCompleted}
                  >
                    <span className={`badge ${isCompleted || isActive ? 'badge-success' : statusBadge[node.status]}`}>
                      {isActive ? 'running' : isCompleted ? 'success' : node.status}
                    </span>
                    <span className="pipeline-node__label">{node.label}</span>
                    <span className="pipeline-node__id">{node.id}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pipeline-yaml card">
          <h2>YAML snippet</h2>
          {selectedNode && (
            <p className="pipeline-yaml__meta">
              Stage: <code>{selectedNode.id}</code>
            </p>
          )}
          {selectedYaml ? (
            <pre className="pipeline-yaml__code">
              <code>{selectedYaml}</code>
            </pre>
          ) : (
            <p className="pipeline-yaml__empty">Select a node to view its configuration.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
