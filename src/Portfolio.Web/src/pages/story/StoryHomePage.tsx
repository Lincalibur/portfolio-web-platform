import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TypingHeadline } from '../../components/profile/TypingHeadline';
import './StoryHomePage.css';

interface ProfileHighlight {
  icon: string;
  label?: string;
  text: string;
}

interface ProfileSkill {
  name: string;
  icon: string;
}

interface ProfileSkillGroup {
  title: string;
  skills: ProfileSkill[];
}

interface ProfileSocial {
  name: string;
  url: string;
  iconLight: string;
  iconDark: string;
}

interface ProfileData {
  heroGif: string;
  waveGif: string;
  typingLines: string[];
  quote: string;
  quoteAuthor: string;
  bio: string;
  highlights: ProfileHighlight[];
  skillGroups: ProfileSkillGroup[];
  socials: ProfileSocial[];
}

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
    title: 'API Gateway & Security',
    description: 'Interactive gateway circuit with live attack simulation and security event log.',
  },
  {
    to: '/story/automation',
    num: '04',
    title: 'Automation Hub',
    description: 'Script repository — reconnaissance and deployment demos.',
  },
];

export function StoryHomePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/fixtures/profile.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json() as Promise<ProfileData>;
      })
      .then(setProfile)
      .catch(() => setError('Could not load profile content.'));
  }, []);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!profile) {
    return <p className="loading-text">Loading profile…</p>;
  }

  return (
    <div className="story-home">
      <section className="profile-hero card">
        <img
          src={profile.heroGif}
          alt="Profile banner"
          className="profile-hero__banner"
        />

        <div className="profile-hero__wave">
          <img src={profile.waveGif} alt="" aria-hidden="true" width={40} height={40} />
        </div>

        <TypingHeadline lines={profile.typingLines} />

        <p className="profile-hero__role">Developer</p>

        <blockquote className="profile-quote">
          <p>&ldquo;{profile.quote}&rdquo;</p>
          <footer>— {profile.quoteAuthor}</footer>
        </blockquote>

        <p className="profile-bio">{profile.bio}</p>

        <ul className="profile-highlights">
          {profile.highlights.map((item) => (
            <li key={item.text}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label ? (
                <>
                  <strong>{item.label}:</strong> {item.text}
                </>
              ) : (
                item.text
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="profile-skills">
        {profile.skillGroups.map((group) => (
          <div key={group.title} className="profile-skills__group card">
            <h2>{group.title}</h2>
            <div className="profile-skills__icons">
              {group.skills.map((skill) => (
                <img
                  key={skill.name}
                  src={skill.icon}
                  alt={skill.name}
                  title={skill.name}
                  width={36}
                  height={36}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="profile-socials card">
        <h2>Socials</h2>
        <div className="profile-socials__links">
          {profile.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="profile-socials__link"
              aria-label={social.name}
            >
              <picture>
                <source media="(prefers-color-scheme: dark)" srcSet={social.iconDark} />
                <img src={social.iconLight} alt="" width={32} height={32} />
              </picture>
            </a>
          ))}
        </div>
      </section>

      <section className="story-home__explore">
        <header className="story-home__header">
          <span className="badge badge-success">Authenticated</span>
          <h2>Explore the story</h2>
          <p>
            You passed the gateway. Each block below demonstrates a different engineering
            capability — select one from the sidebar or the cards below.
          </p>
        </header>

        <div className="story-home__grid">
          {blocks.map((block) => (
            <Link key={block.to} to={block.to} className="story-home__card card">
              <span className="story-home__num">{block.num}</span>
              <h3>{block.title}</h3>
              <p>{block.description}</p>
              <span className="story-home__link">Open block →</span>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnVuNWhzcHlzOTN1Y3hzdzI1NGV1ZXhrbmVkaHE3MTdqZWg3Mm1kMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1CNsm9ZkHF0m4/giphy.gif" alt="Overview" style={{ width: '100%', borderRadius: '12px', display: 'block', margin: '0 auto' }} />
        </div>
      </section>
    </div>
  );
}
