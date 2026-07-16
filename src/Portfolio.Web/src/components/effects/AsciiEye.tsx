import { useEffect, useRef } from 'react';
import './AsciiEye.css';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-[]/';
const CHARSET_LEN = CHARSET.length;
const FONT_SIZE = 9;
const LINE_HEIGHT = 10;
const PUPIL_MAX_RATIO = 0.34;
const PUPIL_VOID_RATIO = 0.11;
const EYE_RX_RATIO = 0.4;
const EYE_RY_RATIO = 0.24;

const GREEN_BRIGHT = '#c8ffd4';
const GREEN_MID = '#39ff14';
const GREEN_DIM = 'rgba(57, 255, 20, 0.35)';
const GREEN_FAINT = 'rgba(57, 255, 20, 0.07)';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET_LEN)] ?? '0';
}

interface AsciiEyeProps {
  className?: string;
}

export function AsciiEye({ className }: AsciiEyeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const pupilRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const gridRef = useRef({ cols: 0, rows: 0, chars: [] as string[][] });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const rootEl = root;
    const canvasEl = canvas;
    const ctx2d = ctx;
    let width = 0;
    let height = 0;
    let blinkUntil = 0;
    let blinkTimeout = 0;

    function resize() {
      const rect = rootEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(1, Math.floor(width / FONT_SIZE));
      const rows = Math.max(1, Math.floor(height / LINE_HEIGHT));
      const chars = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => randomChar()),
      );

      gridRef.current = { cols, rows, chars };
    }

    function scheduleBlink() {
      if (reducedMotion) {
        return;
      }

      blinkTimeout = window.setTimeout(
        () => {
          blinkUntil = performance.now() + 140;
          scheduleBlink();
        },
        3200 + Math.random() * 3800,
      );
    }

    function updateMouse(clientX: number, clientY: number) {
      const rect = rootEl.getBoundingClientRect();
      mouseRef.current = {
        x: clientX - (rect.left + rect.width / 2),
        y: clientY - (rect.top + rect.height / 2),
        active: true,
      };
    }

    function draw(timestamp: number) {
      frameRef.current = window.requestAnimationFrame(draw);

      const { cols, rows, chars } = gridRef.current;
      if (cols === 0 || rows === 0) {
        return;
      }

      const centerX = cols / 2;
      const centerY = rows / 2;
      const eyeRx = cols * EYE_RX_RATIO;
      const eyeRy = rows * EYE_RY_RATIO;
      const pupilMax = eyeRx * PUPIL_MAX_RATIO;
      const pupilVoid = eyeRx * PUPIL_VOID_RATIO;
      const blinking = timestamp < blinkUntil;
      const blinkScale = blinking ? 0.12 : 1;

      const mouse = mouseRef.current;
      const targetPupilX = mouse.active ? mouse.x / FONT_SIZE : 0;
      const targetPupilY = mouse.active ? (mouse.y / LINE_HEIGHT) * 0.7 : 0;
      const targetDist = Math.hypot(targetPupilX, targetPupilY);
      const clampScale = targetDist > pupilMax ? pupilMax / targetDist : 1;
      const desiredX = targetPupilX * clampScale;
      const desiredY = targetPupilY * clampScale;

      const lerp = reducedMotion ? 1 : 0.18;
      pupilRef.current = {
        x: pupilRef.current.x + (desiredX - pupilRef.current.x) * lerp,
        y: pupilRef.current.y + (desiredY - pupilRef.current.y) * lerp,
      };

      if (!reducedMotion) {
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            if (Math.random() > 0.72) {
              chars[row][col] = randomChar();
            }
          }
        }
      }

      ctx2d.clearRect(0, 0, width, height);
      ctx2d.font = `${FONT_SIZE}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;
      ctx2d.textBaseline = 'top';

      const pupilX = pupilRef.current.x;
      const pupilY = pupilRef.current.y;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const cx = col - centerX + 0.5;
          const cy = (row - centerY + 0.5) / blinkScale;
          const eyeDist = (cx * cx) / (eyeRx * eyeRx) + (cy * cy) / (eyeRy * eyeRy);

          if (blinking && eyeDist <= 1) {
            ctx2d.fillStyle = GREEN_MID;
            ctx2d.globalAlpha = 0.85;
            ctx2d.fillText('_', col * FONT_SIZE, row * LINE_HEIGHT);
            ctx2d.globalAlpha = 1;
            continue;
          }

          const pupilDx = Math.abs(cx - pupilX);
          const pupilDy = Math.abs(cy - pupilY);
          const inDiamondVoid = pupilDx + pupilDy * 1.22 < pupilVoid * 1.42;
          const inCrossVoid =
            (pupilDx < pupilVoid * 0.2 && pupilDy < pupilVoid * 2.05) ||
            (pupilDy < pupilVoid * 0.2 && pupilDx < pupilVoid * 2.15);
          if (eyeDist <= 1 && (inDiamondVoid || inCrossVoid)) {
            continue;
          }

          let alpha = 0;
          let color = GREEN_MID;

          if (eyeDist <= 1) {
            const edgeFade = 1 - smoothstep(eyeDist, 0.45, 1);
            const pupilDist = Math.hypot(cx - pupilX, cy - pupilY);
            const irisShade = smoothstep(pupilVoid, pupilVoid * 2.8, pupilDist);
            const centerGlow = 1 - smoothstep(0, eyeRx * 0.55, Math.hypot(cx, cy));
            alpha = 0.45 + edgeFade * 0.5 + irisShade * 0.2 + centerGlow * 0.15;
            color = alpha > 0.78 ? GREEN_BRIGHT : GREEN_MID;
          } else if (eyeDist <= 1.22) {
            alpha = (1 - smoothstep(1, 1.22, eyeDist)) * 0.22;
            color = GREEN_DIM;
          } else {
            alpha = 0.035 + Math.random() * 0.04;
            color = GREEN_FAINT;
          }

          if (alpha < 0.03) {
            continue;
          }

          ctx2d.fillStyle = color;
          ctx2d.globalAlpha = alpha;
          ctx2d.fillText(chars[row][col], col * FONT_SIZE, row * LINE_HEIGHT);
        }
      }

      ctx2d.globalAlpha = 1;
    }

    function onPointerMove(event: PointerEvent) {
      updateMouse(event.clientX, event.clientY);
    }

    function onPointerLeave() {
      mouseRef.current.active = false;
    }

    resize();
    scheduleBlink();
    frameRef.current = window.requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => resize());
    observer.observe(rootEl);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rootEl.addEventListener('pointerleave', onPointerLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      rootEl.removeEventListener('pointerleave', onPointerLeave);
      window.clearTimeout(blinkTimeout);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const rootClass = ['ascii-eye', className].filter(Boolean).join(' ');

  return (
    <div ref={rootRef} className={rootClass} aria-hidden="true">
      <canvas ref={canvasRef} className="ascii-eye__canvas" />
    </div>
  );
}
