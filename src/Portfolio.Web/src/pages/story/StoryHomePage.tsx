import { Link } from 'react-router-dom';
import './StoryHomePage.css';

const blocks = [
  {
    to: '/story/pipeline',
    num: '02',
    title: 'DevOps Pipeline',
    description: 'Explore how this project ships — CI/CD nodes, statuses, and YAML snippets.',
  },
  {
    to: '/story/orchestration',
    num: '03',
    title: 'System Orchestration',
    description: 'Live host metrics — CPU, memory, and container health on the edge.',
  },
  {
    to: '/story/automation',
    num: '04',
    title: 'Automation Hub',
    description: 'Terminal-style demo of log parsing and scripting workflows.',
  },
  {
    to: '/story/docs',
    num: '05',
    title: 'Documentation Vault',
    description: 'Solution design, implementation plan, and architecture blueprints.',
  },
];

export function StoryHomePage() {
  return (
    <div className="story-home">
      <header className="story-home__header">
        <span className="badge badge-success">Authenticated</span>
        <h1>Welcome to the story</h1>
        <p>
          You passed the gateway. Each block below demonstrates a different engineering
          capability — select one from the sidebar or the cards below.
        </p>
      </header>

      <div className="story-home__grid">
        {blocks.map((block) => (
          <Link key={block.to} to={block.to} className="story-home__card card">
            <span className="story-home__num">{block.num}</span>
            <h2>{block.title}</h2>
            <p>{block.description}</p>
            <span className="story-home__link">Open block →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
