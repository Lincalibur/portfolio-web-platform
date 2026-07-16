import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'education'
  | 'fintech'
  | 'shield'
  | 'globe'
  | 'handshake'
  | 'mail'
  | 'phone'
  | 'github'
  | 'linkedin'
  | 'spark'
  | 'rocket'
  | 'chat'
  | 'bolt'
  | 'party'
  | 'stop'
  | 'play'
  | 'arrow-down'
  | 'arrow-right'
  | 'brand';

interface VectorIconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  title?: string;
}

const paths: Record<IconName, ReactElement> = {
  brand: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M8 12h8M12 8v8" />
    </>
  ),
  education: (
    <>
      <path d="M3 9.5 12 4l9 5.5-9 5.5L3 9.5z" />
      <path d="M7 12.5v4.2c0 .7 2.2 2.3 5 2.3s5-1.6 5-2.3v-4.2" />
      <path d="M21 10v6" />
    </>
  ),
  fintech: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
      <path d="M2.5 10h19" />
      <path d="M7 15h3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6L12 3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  handshake: (
    <>
      <path d="M8 13 4.5 9.5a2 2 0 0 1 0-2.8l1.2-1.2a2 2 0 0 1 2.8 0L11 8" />
      <path d="m16 13 3.5-3.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L13 8" />
      <path d="M9 14.5 11 17l1.5-1.5L15 18l3-3" />
      <path d="M8.5 11.5 11 14" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="1.5" />
      <path d="M10 5h4M11 18.5h2" />
    </>
  ),
  github: (
    <path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.5 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5z" />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
  spark: (
    <path d="M12 3.5 13.2 9l5.3 1.2-5.3 1.2L12 16.5 10.8 11.4 5.5 10.2 10.8 9 12 3.5z" />
  ),
  rocket: (
    <>
      <path d="M14 4c2.5 1 4.5 3 5.5 5.5L14 15l-5.5-5.5C10 7 12 5 14 4z" />
      <path d="M9 14.5 6 18l1.2.8L11 15.5" />
      <path d="M9.5 10.5 7 9" />
      <circle cx="14.5" cy="9.5" r="1" />
    </>
  ),
  chat: (
    <>
      <path d="M5 5h14v10H9l-3 3v-3H5V5z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  bolt: <path d="M13 3 6 14h5l-1 7 7-11h-5l1-7z" />,
  party: (
    <>
      <path d="M5 19 10 8l6 3-5 9-6-1z" />
      <path d="M14 5h.01M17 7h.01M19 10h.01M16 12h.01" />
    </>
  ),
  stop: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8v8H8z" />
    </>
  ),
  play: <path d="M8 6v12l11-6L8 6z" />,
  'arrow-down': <path d="M12 5v14M6 13l6 6 6-6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
};

/**
 * Inline phosphor-style SVG icon used in place of emoji glyphs.
 */
export function VectorIcon({ name, title, className, ...rest }: VectorIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`vector-icon${className ? ` ${className}` : ''}`}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

/** Maps profile fixture icon keys (or legacy emoji) onto VectorIcon names. */
export function resolveHighlightIcon(icon: string): IconName {
  const key = icon.trim().toLowerCase();
  const map: Record<string, IconName> = {
    education: 'education',
    fintech: 'fintech',
    shield: 'shield',
    globe: 'globe',
    handshake: 'handshake',
    '🎓': 'education',
    '💳': 'fintech',
    '🛡️': 'shield',
    '🌍': 'globe',
    '🤝': 'handshake',
  };
  return map[key] ?? map[icon] ?? 'spark';
}
