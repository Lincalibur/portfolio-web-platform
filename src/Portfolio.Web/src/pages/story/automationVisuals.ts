export type LineTone = 'default' | 'info' | 'success' | 'warn' | 'error' | 'accent' | 'art';

export type LineMeta = 'banner' | 'progress' | 'ascii' | 'tree' | 'finale' | 'sparkle';

export interface TerminalLine {
  text: string;
  tone?: LineTone;
  meta?: LineMeta;
  id?: string;
}

export interface ScriptInputOption {
  value: string;
  label: string;
}

export interface ScriptInputDefinition {
  id: string;
  label: string;
  type: 'text' | 'select';
  default: string;
  placeholder?: string;
  options?: ScriptInputOption[];
}

export type AutomationStep =
  | { type: 'line'; line: TerminalLine; delayMs?: number }
  | { type: 'progress'; id: string; label: string; percent: number; delayMs?: number }
  | { type: 'frames'; frames: string[]; tone?: LineTone; meta?: LineMeta; frameDelayMs: number }
  | { type: 'spinner'; message: string; durationMs: number; intervalMs?: number }
  | { type: 'pause'; durationMs: number }
  | { type: 'finale'; success: boolean };

export const PORTFOLIO_BANNER = [
  '╔═══════════════════════════════════════════════════════╗',
  '║   ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ║',
  '║   ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗║',
  '║   ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║║',
  '║   ██╔═══╝ ██║   ██║██╔═══╝    ██║   ██╔══╝  ██║   ██║║',
  '║   ██║     ╚██████╔╝██║        ██║   ███████╗╚██████╔╝║',
  '║   ╚═╝      ╚═════╝ ╚═╝        ╚═╝   ╚══════╝ ╚═════╝ ║',
  '║          ECOSYSTEM  ·  AUTOMATION HUB  ·  v1.0       ║',
  '╚═══════════════════════════════════════════════════════╝',
].join('\n');

export const ROCKET_FRAMES = [
  [
    '              ▲',
    '             ███',
    '            █████',
    '           ▐█████▌',
    '          ▐██▀▀▀██▌',
    '             ││',
    '            ╱  ╲',
  ].join('\n'),
  [
    '              ▲',
    '             ███',
    '            █████',
    '           ▐█████▌  ✦',
    '          ▐██▀▀▀██▌ ✦ ✦',
    '             ││',
    '            ╱  ╲',
    '           ✦    ✦',
  ].join('\n'),
  [
    '         ✦    ▲    ✦',
    '             ███',
    '            █████',
    '       ✦   ▐█████▌   ✦',
    '          ▐██▀▀▀██▌',
    '             ││',
    '            ╱  ╲',
    '      ✦  ✦  ✦  ✦  ✦  ✦',
  ].join('\n'),
  [
    '    ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦',
    '              ▲',
    '             ███',
    '            █████',
    '           ▐█████▌',
    '          ▐██▀▀▀██▌',
    '      ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦',
    '         L I F T O F F !',
  ].join('\n'),
];

export const RADAR_FRAME = [
  '           .-~~~-.',
  '         .\'  ___  \'.',
  '        /  /   \\  \\',
  '       |  | (●) |  |   ◉ SCANNING',
  '        \\  \\___/  /',
  '         \'.     .\'',
  '           `-~-.',
].join('\n');

export function buildProgressBar(percent: number, width = 28): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${clamped.toString().padStart(3, ' ')}%`;
}

export function buildSuccessTree(items: string[]): string {
  if (items.length === 0) {
    return '└── (no results)';
  }

  return items
    .map((item, index) => {
      const prefix = index === items.length - 1 ? '└──' : '├──';
      return `${prefix} ✓ ${item}`;
    })
    .join('\n');
}

export function buildFailureTree(items: string[]): string {
  return items.map((item, index) => `${index === items.length - 1 ? '└──' : '├──'} ✗ ${item}`).join('\n');
}

export function buildSparkleFinale(title: string, subtitle: string): string {
  return [
    '✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦',
    '',
    `        ${title}`,
    `           ${subtitle}`,
    '',
    '✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦',
  ].join('\n');
}

export const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function bannerSteps(): AutomationStep[] {
  return [
    {
      type: 'line',
      line: { text: PORTFOLIO_BANNER, tone: 'accent', meta: 'banner' },
      delayMs: 120,
    },
    { type: 'pause', durationMs: 200 },
  ];
}

export function progressStep(id: string, label: string, percent: number, delayMs = 180): AutomationStep {
  return {
    type: 'progress',
    id,
    label,
    percent,
    delayMs,
  };
}

export function progressSequence(
  id: string,
  label: string,
  steps: number[],
  delayMs = 160,
): AutomationStep[] {
  return steps.map((percent) => progressStep(id, label, percent, delayMs));
}
