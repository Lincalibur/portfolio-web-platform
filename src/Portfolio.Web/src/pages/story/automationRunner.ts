import {
  generateAutomationSteps,
  progressLine,
  type AutomationStep,
  type ScriptInputDefinition,
  type TerminalLine,
} from './automationSimulators';
import { SPINNER_FRAMES } from './automationVisuals';

export interface RunAutomationOptions {
  scriptId: string;
  params: Record<string, string>;
  command: string;
  baseDelayMs: number;
  onLinesChange: (lines: TerminalLine[]) => void;
  onSpinnerChange: (spinner: string | null) => void;
  onFinaleChange: (finale: 'success' | 'failure' | null) => void;
  isCancelled: () => boolean;
}

function upsertLine(lines: TerminalLine[], line: TerminalLine): TerminalLine[] {
  if (!line.id) {
    return [...lines, line];
  }

  const index = lines.findIndex((entry) => entry.id === line.id);
  if (index === -1) {
    return [...lines, line];
  }

  const next = [...lines];
  next[index] = line;
  return next;
}

function wait(ms: number, isCancelled: () => boolean): Promise<void> {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  }).then(() => {
    if (isCancelled()) {
      throw new Error('cancelled');
    }
  });
}

export async function runAutomationSequence(options: RunAutomationOptions): Promise<void> {
  const steps = generateAutomationSteps(options.scriptId, options.params);
  let lines: TerminalLine[] = [{ text: `$ ${options.command}`, tone: 'info' }];
  options.onLinesChange(lines);
  options.onFinaleChange(null);
  options.onSpinnerChange(null);

  try {
    for (const step of steps) {
      if (options.isCancelled()) {
        return;
      }

      switch (step.type) {
        case 'line': {
          await wait(step.delayMs ?? options.baseDelayMs, options.isCancelled);
          lines = [...lines, step.line];
          options.onLinesChange(lines);
          break;
        }
        case 'progress': {
          await wait(step.delayMs ?? options.baseDelayMs, options.isCancelled);
          lines = upsertLine(lines, progressLine(step.id, step.label, step.percent));
          options.onLinesChange(lines);
          break;
        }
        case 'frames': {
          for (const frame of step.frames) {
            if (options.isCancelled()) {
              return;
            }

            lines = upsertLine(lines, {
              id: 'animation-frame',
              text: frame,
              tone: step.tone ?? 'accent',
              meta: step.meta ?? 'ascii',
            });
            options.onLinesChange(lines);
            await wait(step.frameDelayMs, options.isCancelled);
          }

          lines = lines.filter((line) => line.id !== 'animation-frame');
          options.onLinesChange(lines);
          break;
        }
        case 'spinner': {
          const interval = step.intervalMs ?? 90;
          const iterations = Math.ceil(step.durationMs / interval);

          for (let i = 0; i < iterations; i += 1) {
            if (options.isCancelled()) {
              return;
            }

            options.onSpinnerChange(`${SPINNER_FRAMES[i % SPINNER_FRAMES.length]} ${step.message}`);
            await wait(interval, options.isCancelled);
          }

          options.onSpinnerChange(null);
          break;
        }
        case 'pause': {
          await wait(step.durationMs, options.isCancelled);
          break;
        }
        case 'finale': {
          options.onFinaleChange(step.success ? 'success' : 'failure');
          await wait(1200, options.isCancelled);
          options.onFinaleChange(null);
          break;
        }
        default:
          break;
      }
    }
  } catch {
    options.onSpinnerChange(null);
  }
}

export type { AutomationStep, ScriptInputDefinition, TerminalLine };
