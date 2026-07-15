import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './SiteHeader.css';

interface SiteHeaderProps {
  children?: ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <span className="site-header__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </span>
          RESUME.SYS
        </Link>
        {children}
      </div>
    </header>
  );
}
