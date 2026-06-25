import {
  bannerSteps,
  buildFailureTree,
  buildProgressBar,
  buildSparkleFinale,
  buildSuccessTree,
  progressSequence,
  RADAR_FRAME,
  ROCKET_FRAMES,
  type AutomationStep,
  type ScriptInputDefinition,
  type TerminalLine,
} from './automationVisuals';

export type { AutomationStep, ScriptInputDefinition, ScriptInputOption, TerminalLine, LineTone, LineMeta } from './automationVisuals';

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMany<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];

  while (picked.length < count && pool.length > 0) {
    const index = randomInt(0, pool.length - 1);
    picked.push(pool.splice(index, 1)[0]);
  }

  return picked;
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export function buildCommand(scriptId: string, params: Record<string, string>): string {
  switch (scriptId) {
    case 'asset_discovery':
      return `python asset_discovery.py --target ${params.target || 'portfolio.local'}`;
    case 'deploy_env':
      return `./deploy_env.sh ${params.environment || 'staging'}`;
    case 'compliance_check':
      return `ansible-playbook compliance_check.yml -i ${params.inventory || 'application_servers'} --extra-vars baseline=${params.baseline || 'cis_level1'}`;
    default:
      return 'run';
  }
}

export function generateAutomationSteps(
  scriptId: string,
  params: Record<string, string>,
): AutomationStep[] {
  switch (scriptId) {
    case 'asset_discovery':
      return generateAssetDiscoverySteps(params);
    case 'deploy_env':
      return generateDeployEnvSteps(params);
    case 'compliance_check':
      return generateComplianceSteps(params);
    default:
      return [{ type: 'line', line: { text: 'Unknown script.', tone: 'error' } }];
  }
}

function generateAssetDiscoverySteps(params: Record<string, string>): AutomationStep[] {
  const target = normalizeDomain(params.target || 'portfolio.local') || 'portfolio.local';
  const assetPool = [
    { prefix: 'api', label: 'API gateway' },
    { prefix: 'vault', label: 'Docs vault' },
    { prefix: 'auth', label: 'Auth service' },
    { prefix: 'mail', label: 'Mail relay' },
    { prefix: 'cdn', label: 'Edge cache' },
    { prefix: 'staging', label: 'Preview environment' },
    { prefix: 'grafana', label: 'Observability' },
  ];

  const discoveredCount = randomInt(3, Math.min(6, assetPool.length));
  const assets = pickMany(assetPool, discoveredCount).map((asset) => ({
    host: `${asset.prefix}.${target}`,
    label: asset.label,
    latency: randomInt(9, 48),
    healthy: Math.random() > 0.15,
  }));

  const treeItems = assets.map(
    (asset) => `${asset.label} (${asset.host}) — ${asset.healthy ? 'online' : 'degraded'} · ${asset.latency}ms`,
  );

  return [
    ...bannerSteps(),
    { type: 'spinner', message: 'Scanning the perimeter…', durationMs: 1400, intervalMs: 80 },
    {
      type: 'line',
      line: { text: RADAR_FRAME, tone: 'accent', meta: 'ascii' },
      delayMs: 400,
    },
    ...progressSequence('scan', `Mapping footprint for ${target}`, [12, 28, 46, 63, 81, 100], 140),
    {
      type: 'line',
      line: {
        text: `${timestamp()}  Found ${assets.length} endpoints across ${target}`,
        tone: 'info',
      },
      delayMs: 200,
    },
    {
      type: 'line',
      line: {
        text: buildSuccessTree(treeItems),
        tone: 'success',
        meta: 'tree',
      },
      delayMs: 300,
    },
    {
      type: 'line',
      line: {
        text: buildSparkleFinale('RECON COMPLETE', `${assets.filter((a) => a.healthy).length}/${assets.length} nodes healthy`),
        tone: 'accent',
        meta: 'finale',
      },
      delayMs: 200,
    },
    { type: 'finale', success: true },
  ];
}

function generateDeployEnvSteps(params: Record<string, string>): AutomationStep[] {
  const environment = (params.environment || 'staging').toLowerCase();
  const envLabel = environment.charAt(0).toUpperCase() + environment.slice(1);
  const serviceCount =
    environment === 'production' ? 5 : environment === 'dev' ? 2 : 3;

  return [
    ...bannerSteps(),
    { type: 'spinner', message: `Preparing ${envLabel} launch sequence…`, durationMs: 1200, intervalMs: 80 },
    ...progressSequence('phase-keys', '🔐 Securing the front door', [20, 45, 70, 100], 150),
    {
      type: 'line',
      line: { text: '    ✓ Gateway keeper online', tone: 'success' },
      delayMs: 120,
    },
    ...progressSequence('phase-network', '🌐 Opening safe network lanes', [15, 40, 68, 100], 150),
    {
      type: 'line',
      line: { text: '    ✓ Isolated bridge network ready', tone: 'success' },
      delayMs: 120,
    },
    ...progressSequence('phase-services', '🚀 Lighting up story blocks', [10, 35, 60, 85, 100], 140),
    {
      type: 'line',
      line: { text: `    ✓ ${serviceCount} services started in ${envLabel}`, tone: 'success' },
      delayMs: 120,
    },
    ...progressSequence('phase-health', '💓 Health check loop', [25, 55, 80, 100], 160),
    {
      type: 'line',
      line: { text: buildProgressBar(100, 32) + '  All systems healthy', tone: 'success', meta: 'progress' },
      delayMs: 200,
    },
    { type: 'frames', frames: ROCKET_FRAMES, tone: 'accent', meta: 'ascii', frameDelayMs: 350 },
    {
      type: 'line',
      line: {
        text: buildSparkleFinale('LAUNCH COMPLETE', `${envLabel} environment is live`),
        tone: 'accent',
        meta: 'finale',
      },
      delayMs: 200,
    },
    { type: 'finale', success: true },
  ];
}

function generateComplianceSteps(params: Record<string, string>): AutomationStep[] {
  const inventory = params.inventory || 'application_servers';
  const baseline = params.baseline || 'cis_level1';
  const inventoryLabel =
    inventory === 'edge_nodes'
      ? 'Edge nodes'
      : inventory === 'data_plane'
        ? 'Data plane'
        : 'Application servers';

  const baselineLabel =
    baseline === 'pci_dss' ? 'PCI-DSS' : baseline === 'custom_hard' ? 'Custom hardening' : 'CIS Level 1';

  const strictAudit = baseline === 'pci_dss' && Math.random() < 0.3;
  const trustScore = strictAudit ? randomInt(61, 84) : randomInt(88, 99);

  const checks = strictAudit
    ? [
        'Firewall baseline enforced',
        'File permissions tightened',
        'Secret scan completed',
        'Permissive config detected on 1 host',
      ]
    : [
        'Firewall baseline enforced',
        'File permissions tightened',
        'No plaintext secrets in config paths',
        'Ingress policy locked down',
        'Audit trail updated',
      ];

  const steps: AutomationStep[] = [
    ...bannerSteps(),
    { type: 'spinner', message: 'Running trust & safety audit…', durationMs: 1300, intervalMs: 80 },
    ...progressSequence('audit', `Evaluating ${inventoryLabel}`, [18, 36, 54, 72, 90, 100], 150),
    {
      type: 'line',
      line: {
        text: `Baseline: ${baselineLabel}  ·  Hosts scanned: ${randomInt(1, 4)}`,
        tone: 'info',
      },
      delayMs: 200,
    },
  ];

  if (strictAudit) {
    steps.push(
      {
        type: 'line',
        line: { text: buildFailureTree(checks), tone: 'warn', meta: 'tree' },
        delayMs: 280,
      },
      {
        type: 'line',
        line: {
          text: [
            '┌─────────────────────────────┐',
            `│  TRUST SCORE:  ${trustScore} / 100       │`,
            '│  STATUS: REVIEW REQUIRED    │',
            '└─────────────────────────────┘',
          ].join('\n'),
          tone: 'warn',
          meta: 'ascii',
        },
        delayMs: 300,
      },
      { type: 'finale', success: false },
    );
  } else {
    steps.push(
      {
        type: 'line',
        line: { text: buildSuccessTree(checks), tone: 'success', meta: 'tree' },
        delayMs: 280,
      },
      {
        type: 'line',
        line: {
          text: [
            '┌─────────────────────────────┐',
            `│  TRUST SCORE:  ${trustScore} / 100       │`,
            '│  STATUS: COMPLIANCE PASSED  │',
            '└─────────────────────────────┘',
          ].join('\n'),
          tone: 'success',
          meta: 'ascii',
        },
        delayMs: 300,
      },
      {
        type: 'line',
        line: {
          text: buildSparkleFinale('AUDIT COMPLETE', 'Security posture verified'),
          tone: 'accent',
          meta: 'finale',
        },
        delayMs: 200,
      },
      { type: 'finale', success: true },
    );
  }

  return steps;
}

export function getDefaultParams(inputs: ScriptInputDefinition[]): Record<string, string> {
  return Object.fromEntries(inputs.map((input) => [input.id, input.default]));
}

export function progressLine(id: string, label: string, percent: number): TerminalLine {
  return {
    id,
    text: `${label}\n${buildProgressBar(percent)}`,
    tone: 'info',
    meta: 'progress',
  };
}
