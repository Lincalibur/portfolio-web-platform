import { useEffect, useRef } from 'react';
import './MatrixBackground.css';

const GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GLYPH_POOL = GLYPHS.split('');
const FONT_SIZE = 15;
const FRAME_INTERVAL_MS = 33;
const TRAIL_ALPHA = 0.07;
const BG_RGB = '10, 14, 23';
const MATRIX_GREEN = '#00ff66';
const MATRIX_GREEN_DIM = 'rgba(0, 255, 102, 0.35)';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainRef = useRef<number[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
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

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnCount = Math.ceil(width / FONT_SIZE);
      const previous = rainRef.current;
      rainRef.current = Array.from({ length: columnCount }, (_, index) => previous[index] ?? Math.random() * -40);

      ctx2d.fillStyle = `rgb(${BG_RGB})`;
      ctx2d.fillRect(0, 0, width, height);
    }

    function draw(timestamp: number) {
      frameRef.current = window.requestAnimationFrame(draw);

      if (timestamp - lastFrameRef.current < FRAME_INTERVAL_MS) {
        return;
      }
      lastFrameRef.current = timestamp;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const drops = rainRef.current;

      ctx2d.fillStyle = `rgba(${BG_RGB}, ${TRAIL_ALPHA})`;
      ctx2d.fillRect(0, 0, width, height);

      ctx2d.font = `${FONT_SIZE}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;

      for (let i = 0; i < drops.length; i += 1) {
        const char = GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        ctx2d.fillStyle = Math.random() > 0.985 ? MATRIX_GREEN : MATRIX_GREEN_DIM;
        ctx2d.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 0.45 + Math.random() * 0.55;
      }
    }

    resize();
    frameRef.current = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div className="matrix-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="matrix-bg__canvas" />
      <div className="matrix-bg__vignette" />
    </div>
  );
}
