import { useEffect, useRef, useState } from 'react';
import './AsciiEye.css';

/** Sclera uses `·`; pupil slot marked with `@` (3×2). */
const EYE_TEMPLATE = [
  '          .--------.          ',
  "        .'          '.        ",
  '       /  ··········  \\       ',
  '      :  ············  :      ',
  '      |  ·····@@@·····  |      ',
  '      |  ·····@@@·····  |      ',
  '      :  ············  :      ',
  '       \\  ··········  /       ',
  "        '.          .'        ",
  "          '--------'          ",
] as const;

const PUPIL = [
  ['█', '▓', '█'],
  ['▓', '░', '▓'],
] as const;

const CLOSED_EYE = [
  '          .--------.          ',
  "        .'          '.        ",
  '       /______________\\       ',
  '      :________________:      ',
  '      |________________|      ',
  '      |________________|      ',
  '      :________________:      ',
  '       \\______________/       ',
  "        '.          .'        ",
  "          '--------'          ",
] as const;

/** Pupil anchor offset for each 3×3 gaze cell. */
const GAZE_OFFSETS: Record<string, { dx: number; dy: number }> = {
  '0,0': { dx: 0, dy: 0 },
  '1,0': { dx: 3, dy: 0 },
  '-1,0': { dx: -3, dy: 0 },
  '0,-1': { dx: 0, dy: -1 },
  '0,1': { dx: 0, dy: 1 },
  '1,-1': { dx: 3, dy: -1 },
  '-1,-1': { dx: -3, dy: -1 },
  '1,1': { dx: 3, dy: 1 },
  '-1,1': { dx: -3, dy: 1 },
};

const BASE_PUPIL_COL = EYE_TEMPLATE[4].indexOf('@');
const BASE_PUPIL_ROW = 4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function renderEye(gazeX: number, gazeY: number): string[] {
  const offset = GAZE_OFFSETS[`${gazeX},${gazeY}`] ?? GAZE_OFFSETS['0,0'];
  const pupilCol = BASE_PUPIL_COL + offset.dx;
  const pupilRow = BASE_PUPIL_ROW + offset.dy;

  return EYE_TEMPLATE.map((line, row) => {
    const chars = [...line.replace(/@/g, '·')];

    for (let py = 0; py < PUPIL.length; py += 1) {
      for (let px = 0; px < PUPIL[0].length; px += 1) {
        const r = pupilRow + py;
        const c = pupilCol + px;
        if (r === row && c >= 0 && c < chars.length && chars[c] === '·') {
          chars[c] = PUPIL[py][px];
        }
      }
    }

    return chars.join('');
  });
}

interface AsciiEyeProps {
  className?: string;
}

export function AsciiEye({ className }: AsciiEyeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    function applyGaze(clientX: number, clientY: number) {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (clientX - cx) / Math.max(rect.width * 0.55, 1);
      const ny = (clientY - cy) / Math.max(rect.height * 0.55, 1);

      const x = clamp(Math.round(nx * 1.35), -1, 1);
      const y = clamp(Math.round(ny * 1.35), -1, 1);

      setGaze((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    }

    function onPointerMove(event: PointerEvent) {
      pendingRef.current = { x: event.clientX, y: event.clientY };
      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const pending = pendingRef.current;
        if (pending) {
          applyGaze(pending.x, pending.y);
        }
      });
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    let timeoutId = 0;

    function scheduleBlink() {
      timeoutId = window.setTimeout(() => {
        setBlink(true);
        timeoutId = window.setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 120);
      }, 2800 + Math.random() * 4200);
    }

    scheduleBlink();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const lines = blink ? [...CLOSED_EYE] : renderEye(gaze.x, gaze.y);
  const rootClass = ['ascii-eye', className].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={rootClass} aria-hidden="true">
      <pre className="ascii-eye__art">
        {lines.map((line, index) => (
          <span key={index} className="ascii-eye__line">
            {line}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}
