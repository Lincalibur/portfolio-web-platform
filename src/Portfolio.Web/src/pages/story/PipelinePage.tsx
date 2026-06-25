import { useEffect, useState } from 'react';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './PipelinePage.css';

interface PipelineNode {
  id: string;
  label: string;
  status: 'success' | 'running' | 'pending' | 'failed';
}

interface PipelineEdge {
  from: string;
  to: string;
}

interface PipelineData {
  title: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  yamlSnippets: Record<string, string>;
}

const statusBadge: Record<PipelineNode['status'], string> = {
  success: 'badge-success',
  running: 'badge-warning',
  pending: 'badge-muted',
  failed: 'badge-warning',
};

export function PipelinePage() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setSelectedId(nodeId);
    void logInteraction('pipeline', 'node_click', JSON.stringify({ nodeId }), getToken());
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
        <span className="badge badge-muted">Block 02</span>
        <h1>{data.title}</h1>
        <p>Click a stage to inspect its CI/CD configuration snippet.</p>
      </header>

      <div className="pipeline-layout">
        <div className="pipeline-graph card">
          <div className="pipeline-nodes">
            {data.nodes.map((node, index) => (
              <div key={node.id} className="pipeline-node-wrapper">
                {index > 0 && <div className="pipeline-connector" aria-hidden="true" />}
                <button
                  type="button"
                  className={`pipeline-node${selectedId === node.id ? ' pipeline-node--selected' : ''}`}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <span className={`badge ${statusBadge[node.status]}`}>{node.status}</span>
                  <span className="pipeline-node__label">{node.label}</span>
                  <span className="pipeline-node__id">{node.id}</span>
                </button>
              </div>
            ))}
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
