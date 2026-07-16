import { useEffect, useState } from 'react';
import { SkeletonKeyArt } from '../../components/effects/SkeletonKeyArt';
import { resolveHighlightIcon, VectorIcon } from '../../components/icons/VectorIcon';
import { TypingHeadline } from '../../components/profile/TypingHeadline';
import { assetUrl } from '../../utils/assetUrl';
import '../../components/icons/VectorIcon.css';
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
    id: 'pipeline',
    num: '02',
    title: 'DevOps Pipeline',
    description: 'Explore how this project ships — CI/CD nodes, statuses, and YAML snippets.',
  },
  {
    id: 'security',
    num: '03',
    title: 'API Gateway & Security',
    description: 'Interactive gateway circuit with live attack simulation and security event log.',
  },
  {
    id: 'automation',
    num: '04',
    title: 'Automation Hub',
    description: 'Script repository — reconnaissance and deployment demos.',
  },
  {
    id: 'contact',
    num: '05',
    title: 'Contact',
    description: 'You made it to the end — reach out via email, cell, GitHub, or LinkedIn.',
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function StoryHomePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(assetUrl('/fixtures/profile.json'))
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
        <SkeletonKeyArt className="profile-hero__key" />

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
              <VectorIcon name={resolveHighlightIcon(item.icon)} className="vector-icon--lg" />
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
          <span className="badge badge-success">Open access</span>
          <h2>Continue the story</h2>
          <p>
            Scroll the single page — or jump ahead to a block. Each section demonstrates a
            different engineering capability.
          </p>
        </header>

        <div className="story-home__grid">
          {blocks.map((block) => (
            <button
              key={block.id}
              type="button"
              className="story-home__card card"
              onClick={() => scrollToId(block.id)}
            >
              <span className="story-home__num">{block.num}</span>
              <h3>{block.title}</h3>
              <p>{block.description}</p>
              <span className="story-home__link">
                Jump down <VectorIcon name="arrow-down" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
