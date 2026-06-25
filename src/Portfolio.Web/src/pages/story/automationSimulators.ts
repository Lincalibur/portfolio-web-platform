export type LineTone = 'default' | 'info' | 'success' | 'warn' | 'error';

export interface TerminalLine {
  text: string;
  tone?: LineTone;
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

export function generateScriptOutput(
  scriptId: string,
  params: Record<string, string>,
): TerminalLine[] {
  switch (scriptId) {
    case 'asset_discovery':
      return generateAssetDiscoveryOutput(params);
    case 'deploy_env':
      return generateDeployEnvOutput(params);
    case 'compliance_check':
      return generateComplianceOutput(params);
    default:
      return [{ text: 'Unknown script.', tone: 'error' }];
  }
}

function generateAssetDiscoveryOutput(params: Record<string, string>): TerminalLine[] {
  const target = normalizeDomain(params.target || 'portfolio.local') || 'portfolio.local';
  const assetPool = [
    { prefix: 'api', type: 'backend_gateway' },
    { prefix: 'vault', type: 'storage_node' },
    { prefix: 'auth', type: 'identity_provider' },
    { prefix: 'mail', type: 'mail_relay' },
    { prefix: 'cdn', type: 'edge_cache' },
    { prefix: 'staging', type: 'preview_environment' },
    { prefix: 'grafana', type: 'observability' },
  ];

  const discoveredCount = randomInt(3, Math.min(6, assetPool.length));
  const assets = pickMany(assetPool, discoveredCount).map((asset) => {
    const latency = randomInt(9, 48);
    const degraded = Math.random() < 0.15;
    return {
      host: `${asset.prefix}.${target}`,
      type: asset.type,
      status: degraded ? 'DEGRADED' : 'ACTIVE',
      latency_ms: latency,
    };
  });

  const lines: TerminalLine[] = [
    { text: `${timestamp()} [INFO] Initiating OSINT subdomain enumeration for: ${target}`, tone: 'info' },
    { text: `${timestamp()} [INFO] Querying crt.sh certificate transparency logs...`, tone: 'info' },
    {
      text: `${timestamp()} [INFO] CT logs returned ${discoveredCount + randomInt(0, 2)} candidates (${discoveredCount} unique hosts after deduplication).`,
      tone: 'info',
    },
    {
      text: `${timestamp()} [INFO] Initializing parallel health verification pipeline (workers=3).`,
      tone: 'info',
    },
  ];

  for (const asset of assets) {
    lines.push({
      text: `${timestamp()} [INFO] Probing network boundary for ${asset.host}...`,
      tone: 'info',
    });
  }

  const activeCount = assets.filter((asset) => asset.status === 'ACTIVE').length;
  const payload = {
    target,
    scanned_at: new Date().toISOString(),
    summary: {
      discovered: assets.length,
      active: activeCount,
      degraded: assets.length - activeCount,
    },
    infrastructure_map: assets,
  };

  lines.push({ text: JSON.stringify(payload, null, 2), tone: 'default' });
  return lines;
}

function generateDeployEnvOutput(params: Record<string, string>): TerminalLine[] {
  const environment = (params.environment || 'staging').toLowerCase();
  const imageTag = environment === 'production' ? '1.4.2' : environment === 'dev' ? 'dev' : 'latest';
  const services =
    environment === 'production'
      ? ['gateway-service', 'vault-service', 'api-service', 'web-service', 'tunnel-agent']
      : environment === 'dev'
        ? ['gateway-service', 'api-service']
        : ['gateway-service', 'vault-service', 'api-service'];

  const successAttempt = randomInt(1, 3);
  const lines: TerminalLine[] = [
    { text: `[*] Initializing automated orchestration for environment: ${environment.toUpperCase()}`, tone: 'info' },
    { text: '[->] Phase 1: Validating local environment capabilities...', tone: 'warn' },
    { text: '[+] Docker daemon reachable. Compose plugin detected.', tone: 'success' },
    { text: '[->] Phase 2: Creating secure network isolation boundaries...', tone: 'warn' },
    { text: `Creating bridge network: ecosystem_${environment}_nw (subnet 172.${randomInt(20, 29)}.0.0/16)...`, tone: 'default' },
    { text: '[+] Network isolation layer active.', tone: 'success' },
    { text: '[->] Phase 3: Provisioning isolated app container layers...', tone: 'warn' },
  ];

  for (const service of services) {
    lines.push({
      text: `Pulling ${service}:${imageTag} ... done (${randomInt(120, 420)}MB)`,
      tone: 'default',
    });
    lines.push({
      text: `Starting ${service} ... OK (container id: ${randomInt(1000, 9999)}${randomInt(1000, 9999)})`,
      tone: 'default',
    });
  }

  lines.push({ text: '[->] Phase 4: Executing post-deployment health integration loop...', tone: 'warn' });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lines.push({ text: `Probing /health (Attempt ${attempt}/3)...`, tone: 'default' });
    if (attempt < successAttempt) {
      lines.push({ text: 'Gateway not ready (HTTP 503). Retrying in 2s...', tone: 'warn' });
    } else {
      lines.push({
        text: `[SUCCESS] Cluster synchronization complete in ${randomInt(8, 24)}s. Application reporting HEALTHY.`,
        tone: 'success',
      });
      break;
    }
  }

  lines.push({ text: '===================================================', tone: 'success' });
  lines.push({
    text: `[✓] ${services.length} services deployed to ${environment.toUpperCase()} on ecosystem_${environment}_nw.`,
    tone: 'success',
  });
  lines.push({ text: '===================================================', tone: 'success' });
  return lines;
}

function generateComplianceOutput(params: Record<string, string>): TerminalLine[] {
  const inventory = params.inventory || 'application_servers';
  const baseline = params.baseline || 'cis_level1';
  const hostCount =
    inventory === 'edge_nodes' ? randomInt(2, 4) : inventory === 'data_plane' ? randomInt(3, 6) : randomInt(1, 3);

  const hosts = Array.from({ length: hostCount }, (_, index) => `${inventory.replace('_', '-')}-${index + 1}`);
  const permissivePath = Math.random() < 0.25 ? '/etc/app/config/appsettings.json' : null;
  const changedCount = permissivePath ? randomInt(1, 2) : randomInt(0, 1);

  const lines: TerminalLine[] = [
    { text: `PLAY [Automated Infrastructure Hardening and Compliance Audit | baseline=${baseline}] ***`, tone: 'info' },
    { text: '', tone: 'default' },
    { text: `TASK [Gathering Facts] *********************************************************`, tone: 'warn' },
    { text: `ok: [${hosts.join(', ')}]`, tone: 'success' },
    { text: '', tone: 'default' },
    { text: 'TASK [Risk Management: Verify system firewall installation baseline] *********', tone: 'warn' },
    { text: `ok: [${hosts[0]}]`, tone: 'success' },
    { text: '', tone: 'default' },
    { text: 'TASK [Audit: Evaluate Firewall Ingress/Egress state] **************************', tone: 'warn' },
    { text: `changed: [${hosts[0]}]`, tone: 'success' },
    { text: '', tone: 'default' },
    { text: 'TASK [Security Hardening: Ensure system file permissions mask is restrictive] *', tone: 'warn' },
  ];

  if (permissivePath) {
    lines.push({ text: `changed: [${hosts[hosts.length - 1]}] => {"path": "${permissivePath}", "mode": "0644"}`, tone: 'warn' });
  } else {
    lines.push({ text: `ok: [${hosts.join(', ')}]`, tone: 'success' });
  }

  lines.push({ text: '', tone: 'default' });
  lines.push({
    text: 'TASK [Credential Hygiene: Scan configuration directories for plaintext JWT keys or secrets] ***',
    tone: 'warn',
  });
  lines.push({ text: `ok: [${hosts.join(', ')}]`, tone: 'success' });
  lines.push({ text: '', tone: 'default' });
  lines.push({
    text: 'TASK [Compliance Guardrail: Assert no secrets are committed to system configuration paths] ***',
    tone: 'warn',
  });

  if (permissivePath && baseline === 'pci_dss') {
    lines.push({
      text: `failed: [${hosts[hosts.length - 1]}] => {"msg": "CRITICAL: permissive file mode on ${permissivePath}"}`,
      tone: 'error',
    });
    lines.push({ text: '', tone: 'default' });
    lines.push({ text: 'PLAY RECAP *********************************************************************', tone: 'info' });
    lines.push({
      text: `${inventory} : ok=4 changed=${changedCount} unreachable=0 failed=1 skipped=0 rescued=0 ignored=0`,
      tone: 'error',
    });
  } else {
    lines.push({
      text: `ok: [${hosts[0]}] => {"msg": "COMPLIANCE PASSED: High-risk secret patterns absent from target paths."}`,
      tone: 'success',
    });
    lines.push({ text: '', tone: 'default' });
    lines.push({ text: 'PLAY RECAP *********************************************************************', tone: 'info' });
    lines.push({
      text: `${inventory} : ok=5 changed=${changedCount} unreachable=0 failed=0 skipped=0 rescued=0 ignored=0`,
      tone: 'success',
    });
  }

  return lines;
}

export function getDefaultParams(inputs: ScriptInputDefinition[]): Record<string, string> {
  return Object.fromEntries(inputs.map((input) => [input.id, input.default]));
}
