import { useEffect, useRef } from 'react';
import './MatrixSectionVeil.css';

const GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
const GLYPH_POOL = GLYPHS.split('');
const FONT_SIZE = 12;
const FRAME_INTERVAL_MS = 42;

interface MatrixSectionVeilProps {
  active: boolean;
}

export function MatrixSectionVeil({ active }: MatrixSectionVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rainRef = useRef<number[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const canvasEl = canvas;
    const ctx2d = ctx;
    let width = 0;
    let height = 0;

    const containerEl = container;

    function resize() {
      const rect = containerEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnCount = Math.max(1, Math.ceil(width / FONT_SIZE));
      const previous = rainRef.current;
      rainRef.current = Array.from(
        { length: columnCount },
        (_, index) => previous[index] ?? Math.random() * -30,
      );

      ctx2d.fillStyle = 'rgb(0, 0, 0)';
      ctx2d.fillRect(0, 0, width, height);
    }

    function draw(timestamp: number) {
      frameRef.current = window.requestAnimationFrame(draw);

      if (!activeRef.current) {
        if (timestamp - lastFrameRef.current < FRAME_INTERVAL_MS) {
          return;
        }
        lastFrameRef.current = timestamp;

        const drops = rainRef.current;
        ctx2d.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx2d.fillRect(0, 0, width, height);

        ctx2d.font = `${FONT_SIZE}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;

        for (let i = 0; i < drops.length; i += 1) {
          const char = GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
          const x = i * FONT_SIZE;
          const y = drops[i] * FONT_SIZE;

          ctx2d.fillStyle =
            Math.random() > 0.94 ? '#c8ffd4' : Math.random() > 0.55 ? '#39ff14' : 'rgba(57, 255, 20, 0.32)';
          ctx2d.fillText(char, x, y);

          if (y > height && Math.random() > 0.96) {
            drops[i] = 0;
          }

          drops[i] += 0.5 + Math.random() * 0.55;
        }
      }
    }

    resize();
    frameRef.current = window.requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => resize());
    observer.observe(containerEl);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const veilClass = [
    'matrix-section-veil',
    active ? 'matrix-section-veil--clear' : 'matrix-section-veil--dense',
  ].join(' ');

  return (
    <div ref={containerRef} className={veilClass} aria-hidden="true">
      <canvas ref={canvasRef} className="matrix-section-veil__canvas" />
      <div className="matrix-section-veil__scanlines" />
    </div>
  );
}
