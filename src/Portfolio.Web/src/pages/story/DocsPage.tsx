import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import './DocsPage.css';

interface DocEntry {
  id: string;
  title: string;
  path: string;
}

const documents: DocEntry[] = [
  {
    id: 'solutionDesign',
    title: 'Solution Design',
    path: '/docs/solutionDesign.md',
  },
  {
    id: 'implementationPlan',
    title: 'Implementation Plan',
    path: '/docs/implementationPlan.md',
  },
];

export function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void logInteraction('docs', 'view', null, getToken());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(selectedDoc.path)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load the selected document.');
        setLoading(false);
      });
  }, [selectedDoc]);

  function handleSelectDoc(doc: DocEntry) {
    setSelectedDoc(doc);
    void logInteraction('docs', 'open_doc', JSON.stringify({ docId: doc.id }), getToken());
  }

  return (
    <div className="docs-page">
      <header className="block-header">
        <span className="badge badge-muted">Block 05</span>
        <h1>Documentation Vault</h1>
        <p>Architecture blueprints and the feature delivery plan for this project.</p>
      </header>

      <div className="docs-layout">
        <nav className="docs-nav card" aria-label="Documents">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              className={`docs-nav__item${selectedDoc.id === doc.id ? ' docs-nav__item--active' : ''}`}
              onClick={() => handleSelectDoc(doc)}
            >
              {doc.title}
            </button>
          ))}
        </nav>

        <article className="docs-viewer card">
          {error && <div className="alert alert-error">{error}</div>}
          {loading && !error && <p className="loading-text">Loading document…</p>}
          {!loading && !error && (
            <div className="markdown-body">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
