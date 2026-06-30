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
            ◈
          </span>
          Interactive Resume
        </Link>
        {children}
      </div>
    </header>
  );
}
