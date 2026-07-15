import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { logInteraction } from '../../api/apiClient';
import { getToken } from '../../auth/authStorage';
import { assetUrl } from '../../utils/assetUrl';
import './ContactPage.css';

interface ContactData {
  finaleGif: string;
  headline: string;
  subheadline: string;
  prompt: string;
  email: string;
  cell: string;
  github: string;
  linkedin: string;
}

interface ProfileFixture {
  contact: ContactData;
}

const contactChannels = [
  {
    key: 'email',
    label: 'Email',
    emoji: '✉️',
    tone: 'email',
    getHref: (contact: ContactData) => `mailto:${contact.email}`,
    getValue: (contact: ContactData) => contact.email,
    getAction: () => 'Drop me a line',
  },
  {
    key: 'cell',
    label: 'Cell',
    emoji: '📱',
    tone: 'cell',
    getHref: (contact: ContactData) => `tel:${contact.cell.replace(/\s/g, '')}`,
    getValue: (contact: ContactData) => contact.cell,
    getAction: () => 'Give me a ring',
  },
  {
    key: 'github',
    label: 'GitHub',
    emoji: '🐙',
    tone: 'github',
    getHref: (contact: ContactData) => contact.github,
    getValue: () => 'lincalibur',
    getAction: () => 'Peek the repos',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    emoji: '💼',
    tone: 'linkedin',
    getHref: (contact: ContactData) => contact.linkedin,
    getValue: () => 'liam-olivier',
    getAction: () => 'Let’s connect',
  },
] as const;

export function ContactPage() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(assetUrl('/fixtures/profile.json'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load contact details');
        return res.json() as Promise<ProfileFixture>;
      })
      .then((profile) => setContact(profile.contact))
      .catch(() => setError('Could not load contact details.'));

    void logInteraction('contact', 'view', null, getToken());
  }, []);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!contact) {
    return <p className="loading-text">Loading contact page…</p>;
  }

  return (
    <div className="contact-page">
      <section className="contact-hero card">
        <div className="contact-hero__sparkles" aria-hidden="true">
          {['✨', '🚀', '💬', '⚡', '🎉'].map((spark, index) => (
            <span key={spark} style={{ animationDelay: `${index * 0.35}s` }}>
              {spark}
            </span>
          ))}
        </div>

        <img
          src={contact.finaleGif}
          alt=""
          className="contact-hero__gif"
          aria-hidden="true"
        />

        <p className="contact-hero__eyebrow">Finale · Block 05</p>
        <h1 className="contact-hero__title">{contact.headline}</h1>
        <p className="contact-hero__sub">{contact.subheadline}</p>

        <p className="contact-hero__prompt">
          <span className="contact-hero__prompt-arrow" aria-hidden="true">
            ↓
          </span>
          {contact.prompt}
        </p>
      </section>

      <section className="contact-grid" aria-label="Contact methods">
        {contactChannels.map((channel, index) => {
          const href = channel.getHref(contact);
          const external = channel.key === 'github' || channel.key === 'linkedin';

          return (
            <a
              key={channel.key}
              href={href}
              className={`contact-card contact-card--${channel.tone} card`}
              style={{ animationDelay: `${index * 0.12}s` }}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              onClick={() => {
                void logInteraction(
                  'contact',
                  'click_channel',
                  JSON.stringify({ channel: channel.key }),
                  getToken(),
                );
              }}
            >
              <span className="contact-card__emoji" aria-hidden="true">
                {channel.emoji}
              </span>
              <span className="contact-card__label">{channel.label}</span>
              <span className="contact-card__value">{channel.getValue(contact)}</span>
              <span className="contact-card__action">{channel.getAction()} →</span>
            </a>
          );
        })}
      </section>

      <section className="contact-footer card">
        <p>
          Prefer to re-run the tour? Head back to the{' '}
          <Link to="/story">story overview</Link> or sign out when you are done exploring.
        </p>
        <p className="contact-footer__signoff">Thanks for stopping by — Liam</p>
      </section>
    </div>
  );
}
