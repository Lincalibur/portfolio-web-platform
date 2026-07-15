import { useCallback, useEffect, useState } from 'react';
import { BootIntro, shouldSkipBootIntro } from '../components/effects/BootIntro';
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
  { id: 'hero', label: 'Intro' },
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
  const [bootComplete, setBootComplete] = useState(() => shouldSkipBootIntro());

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('portfolio-booting', !bootComplete);
    return () => {
      document.body.classList.remove('portfolio-booting');
    };
  }, [bootComplete]);

  useEffect(() => {
    if (!bootComplete) {
      return;
    }

    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      window.requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [bootComplete]);

  useEffect(() => {
    if (!bootComplete) {
      return;
    }

    const nodes = sections
      .map((section) => document.getElementById(section.id))
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
      {
        // Middle band of the viewport = "in focus"
        rootMargin: '-28% 0px -42% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [bootComplete]);

  return (
    <>
      {!bootComplete && <BootIntro onComplete={handleBootComplete} />}

      <div
        className={`page portfolio-page${bootComplete ? ' portfolio-page--ready' : ' portfolio-page--booting'}`}
        aria-hidden={!bootComplete}
      >
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
          <div className="portfolio-stream">
            <section
              id="hero"
              className={`portfolio-section${activeId === 'hero' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
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
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => scrollToSection('overview')}
                  >
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

            <section
              id="overview"
              className={`portfolio-section${activeId === 'overview' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
              <StoryHomePage />
            </section>

            <section
              id="pipeline"
              className={`portfolio-section${activeId === 'pipeline' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
              <PipelinePage />
            </section>

            <section
              id="security"
              className={`portfolio-section${activeId === 'security' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
              <OrchestrationPage />
            </section>

            <section
              id="automation"
              className={`portfolio-section${activeId === 'automation' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
              <AutomationPage />
            </section>

            <section
              id="contact"
              className={`portfolio-section${activeId === 'contact' ? ' portfolio-section--active' : ' portfolio-section--dim'}`}
            >
              <ContactPage />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
