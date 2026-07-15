import { useEffect, useState } from 'react';
import { VectorIcon } from '../components/icons/VectorIcon';
import { SiteHeader } from '../components/layout/SiteHeader';
import { AutomationPage } from './story/AutomationPage';
import { ContactPage } from './story/ContactPage';
import { OrchestrationPage } from './story/OrchestrationPage';
import { PipelinePage } from './story/PipelinePage';
import { StoryHomePage } from './story/StoryHomePage';
import './PortfolioPage.css';
import '../components/icons/VectorIcon.css';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'security', label: 'API Security' },
  { id: 'automation', label: 'Automation' },
  { id: 'contact', label: 'Contact' },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function PortfolioPage() {
  const [activeId, setActiveId] = useState<string>('hero');

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      window.requestAnimationFrame(() => scrollToSection(hash));
    }
  }, []);

  useEffect(() => {
    const nodes = ['hero', ...sections.map((s) => s.id)]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page portfolio-page">
      <SiteHeader>
        <nav className="portfolio-nav" aria-label="Page sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`portfolio-nav__link${activeId === section.id ? ' portfolio-nav__link--active' : ''}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </SiteHeader>

      <div className="portfolio-body container">
        <aside className="portfolio-rail card" aria-label="Jump to section">
          <p className="portfolio-rail__label">Scroll story</p>
          <button
            type="button"
            className={`portfolio-rail__link${activeId === 'hero' ? ' portfolio-rail__link--active' : ''}`}
            onClick={() => scrollToSection('hero')}
          >
            Intro
          </button>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`portfolio-rail__link${activeId === section.id ? ' portfolio-rail__link--active' : ''}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </aside>

        <div className="portfolio-stream">
          <section id="hero" className="portfolio-section portfolio-section--hero">
            <div className="portfolio-hero card">
              <p className="portfolio-hero__eyebrow">SYS // BCOMP · FINTECH · API SEC</p>
              <h1>INTERACTIVE RESUME</h1>
              <p className="portfolio-hero__prompt">
                root@portfolio:~$ <span>scroll_to_explore</span>
              </p>
              <p className="portfolio-hero__lead">
                Liam Olivier — software developer with a newly earned{' '}
                <strong>Bachelor of Computing</strong>, focused on{' '}
                <strong>Fintech solutions in C#</strong> and hands-on experience building{' '}
                <strong>API security tooling</strong>. One continuous story below — no gate, no
                signup.
              </p>
              <ul className="portfolio-hero__creds">
                <li>Bachelor of Computing</li>
                <li>Fintech &amp; enterprise C# development</li>
                <li>API hardening, rate limiting &amp; payload filtering</li>
              </ul>
              <div className="portfolio-hero__actions">
                <button type="button" className="btn btn-primary" onClick={() => scrollToSection('overview')}>
                  Start scrolling
                  <VectorIcon name="arrow-down" />
                </button>
                <a
                  href="https://www.github.com/lincalibur"
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  View GitHub
                </a>
              </div>
            </div>
          </section>

          <section id="overview" className="portfolio-section">
            <StoryHomePage />
          </section>

          <section id="pipeline" className="portfolio-section">
            <PipelinePage />
          </section>

          <section id="security" className="portfolio-section">
            <OrchestrationPage />
          </section>

          <section id="automation" className="portfolio-section">
            <AutomationPage />
          </section>

          <section id="contact" className="portfolio-section">
            <ContactPage />
          </section>
        </div>
      </div>
    </div>
  );
}
