import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { SKELETON_KEY_LINES } from '../../data/skeletonKeyArt';
import './SkeletonKeyArt.css';

const MATRIX_CHARS = '01ｱｲｳｴｵｶｷｸｹｺABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLUMN_DELAY_MS = 11;
const CHAR_SETTLE_MS = 95;

interface SkeletonCell {
  row: number;
  col: number;
  char: string;
  seed: string;
}

function buildCells(): SkeletonCell[] {
  const cells: SkeletonCell[] = [];

  SKELETON_KEY_LINES.forEach((line, row) => {
    [...line].forEach((char, col) => {
      if (char === ' ') {
        return;
      }

      cells.push({
        row,
        col,
        char,
        seed: MATRIX_CHARS[(row * 17 + col * 7) % MATRIX_CHARS.length] ?? '0',
      });
    });
  });

  return cells;
}

const SKELETON_CELLS = buildCells();
const MAX_COL = Math.max(...SKELETON_KEY_LINES.map((line) => line.length), 0);

interface SkeletonKeyArtProps {
  className?: string;
}

export function SkeletonKeyArt({ className }: SkeletonKeyArtProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [playToken, setPlayToken] = useState(0);
  const columnCount = useMemo(() => MAX_COL, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setPlayToken(1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) {
          setPlayToken((token) => token + 1);
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const ready = playToken > 0;
  const rootClass = ['skeleton-key', className].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={rootClass} aria-hidden="true">
      <div
        className="skeleton-key__grid"
        style={
          {
            '--sk-cols': columnCount,
            '--sk-rows': SKELETON_KEY_LINES.length,
            '--sk-total-ms': `${columnCount * COLUMN_DELAY_MS + CHAR_SETTLE_MS}ms`,
          } as CSSProperties
        }
      >
        {SKELETON_CELLS.map((cell) => (
          <span
            key={`${playToken}-${cell.row}-${cell.col}`}
            className={`skeleton-key__cell${ready ? ' skeleton-key__cell--in' : ''}`}
            style={
              {
                '--sk-row': cell.row,
                '--sk-col': cell.col,
                '--sk-delay': `${cell.col * COLUMN_DELAY_MS}ms`,
              } as CSSProperties
            }
          >
            <span className="skeleton-key__seed">{cell.seed}</span>
            <span className="skeleton-key__glyph">{cell.char}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
