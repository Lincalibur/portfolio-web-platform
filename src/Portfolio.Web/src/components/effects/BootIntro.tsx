import { useEffect, useRef, useState } from 'react';
import './BootIntro.css';

export const BOOT_INTRO_STORAGE_KEY = 'portfolio.bootIntroSeen';

type Phase = 'black' | 'rain' | 'typing' | 'exit' | 'done';

interface TypeChunk {
  text: string;
  /** Pause after this chunk finishes (ms). */
  pauseMs?: number;
  /** Newline after chunk. */
  newline?: boolean;
}

const SCRIPT: TypeChunk[] = [
  { text: 'root@portfolio:~$ ' },
  { text: 'boot', pauseMs: 180 },
  { text: ' resume.sys', pauseMs: 420, newline: true },
  { text: 'root@portfolio:~$ ' },
  { text: 'load', pauseMs: 160 },
  { text: ' --profile', pauseMs: 220 },
  { text: ' liam_olivier', pauseMs: 480, newline: true },
  { text: '[OK]', pauseMs: 140 },
  { text: ' phosphor grid online', pauseMs: 360, newline: true },
  { text: '[OK]', pauseMs: 140 },
  { text: ' matrix rain linked', pauseMs: 360, newline: true },
  { text: 'root@portfolio:~$ ' },
  { text: 'open', pauseMs: 180 },
  { text: ' interactive_resume', pauseMs: 520, newline: true },
  { text: '>>', pauseMs: 200 },
  { text: ' ready.', pauseMs: 640 },
];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function shouldSkipBootIntro(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  try {
    return sessionStorage.getItem(BOOT_INTRO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markBootIntroSeen() {
  try {
    sessionStorage.setItem(BOOT_INTRO_STORAGE_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

interface BootIntroProps {
  onComplete: () => void;
}

/**
 * First-visit boot sequence: black → matrix rain reveal → CLI typewriter → site.
 */
export function BootIntro({ onComplete }: BootIntroProps) {
  const [phase, setPhase] = useState<Phase>('black');
  const [typed, setTyped] = useState('');
  const [caretOn, setCaretOn] = useState(true);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  function finish() {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    markBootIntroSeen();
    setPhase('done');
    onCompleteRef.current();
  }

  useEffect(() => {
    if (phase === 'done' || phase === 'exit') {
      return;
    }

    const id = window.setInterval(() => {
      setCaretOn((prev) => !prev);
    }, 480);

    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'black') {
      return;
    }

    const id = window.setTimeout(() => setPhase('rain'), 550);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'rain') {
      return;
    }

    const id = window.setTimeout(() => setPhase('typing'), 1600);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing') {
      return;
    }

    let cancelled = false;

    (async () => {
      let output = '';

      for (const chunk of SCRIPT) {
        if (cancelled) {
          return;
        }

        for (const char of chunk.text) {
          if (cancelled) {
            return;
          }

          output += char;
          setTyped(output);

          const base = char === ' ' ? 55 : /[.:_]/.test(char) ? 70 : 28;
          const jitter = Math.floor(Math.random() * 28);
          await sleep(base + jitter);
        }

        if (chunk.newline) {
          output += '\n';
          setTyped(output);
        }

        await sleep(chunk.pauseMs ?? 90);
      }

      if (!cancelled) {
        // Move to exit in a separate effect so cleanup here cannot block finish().
        setPhase('exit');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exit') {
      return;
    }

    const id = window.setTimeout(() => {
      finish();
    }, 700);

    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === 'done') {
    return null;
  }

  return (
    <div
      className={`boot-intro boot-intro--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="System boot sequence"
    >
      <div className="boot-intro__black" aria-hidden="true" />

      {(phase === 'typing' || phase === 'exit') && (
        <pre className="boot-intro__cli">
          {typed}
          <span className={`boot-intro__caret${caretOn ? ' boot-intro__caret--on' : ''}`} aria-hidden="true">
            █
          </span>
        </pre>
      )}

      {(phase === 'typing' || phase === 'exit' || phase === 'rain') && (
        <button type="button" className="boot-intro__skip" onClick={finish}>
          skip
        </button>
      )}
    </div>
  );
}
