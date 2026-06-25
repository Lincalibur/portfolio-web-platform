import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth } from '../../auth/authStorage';
import { SiteHeader } from './SiteHeader';
import './StoryLayout.css';

const storyBlocks = [
  { to: '/story', label: 'Overview', end: true },
  { to: '/story/pipeline', label: 'Pipeline', end: false },
  { to: '/story/orchestration', label: 'Orchestration', end: false },
  { to: '/story/automation', label: 'Automation', end: false },
  { to: '/story/docs', label: 'Docs Vault', end: false },
];

export function StoryLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/gateway');
  }

  return (
    <div className="page story-layout">
      <SiteHeader>
        <div className="site-header__actions">
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </SiteHeader>

      <div className="container story-layout__body">
        <aside className="story-nav card">
          <p className="story-nav__label">Story blocks</p>
          <nav aria-label="Story navigation">
            {storyBlocks.map((block) => (
              <NavLink
                key={block.to}
                to={block.to}
                end={block.end}
                className={({ isActive }) =>
                  `story-nav__link${isActive ? ' story-nav__link--active' : ''}`
                }
              >
                {block.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="story-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
