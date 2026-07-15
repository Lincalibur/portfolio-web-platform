import { assetUrl } from '../utils/assetUrl';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ENABLE_INTERACTION_METRICS = import.meta.env.VITE_ENABLE_INTERACTION_METRICS === 'true';
const USE_HOST_STATS_API = import.meta.env.VITE_USE_HOST_STATS_API === 'true';
/** Static hosting (e.g. GitHub Pages) — no Portfolio.Api available. */
const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';

const DEMO_OTP_HINT = '000000';

export interface HealthResponse {
  status: string;
}

export interface RequestAccessPayload {
  fullName: string;
  email: string;
  company?: string;
}

export interface RequestAccessResult {
  message: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface VerifyOtpResult {
  accessToken: string;
  expiresAt: string;
}

export interface HostStats {
  cpuPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  containerStatuses: string[];
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AdminLoginResult {
  accessToken: string;
  expiresAt: string;
}

export interface OpsIncident {
  timestamp: string;
  resourcePath: string;
  severity: string;
  status: string;
  summary: string;
}

export interface OpsReport {
  incidents: OpsIncident[];
  totalCvDownloadsLast7Days: number;
  activeTrafficHotspots: string[];
  storageFootprintMb: number;
  retentionDays: number;
}

export interface ValidationProblem {
  errors?: Record<string, string[]>;
  title?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const problem = payload as ValidationProblem | null;
    const message =
      problem?.title ??
      (typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message: string }).message)
        : `Request failed (${response.status})`);

    throw new ApiError(message, response.status, problem?.errors);
  }

  return payload as T;
}

export async function getHealth(): Promise<HealthResponse> {
  if (STATIC_DEMO) {
    return { status: 'healthy' };
  }

  return request<HealthResponse>('/health');
}

export async function requestAccess(payload: RequestAccessPayload): Promise<RequestAccessResult> {
  if (STATIC_DEMO) {
    return {
      message: `Static demo for ${payload.email}: enter code ${DEMO_OTP_HINT} on the next screen (no email is sent on GitHub Pages).`,
    };
  }

  return request<RequestAccessResult>('/api/auth/request-access', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
  if (STATIC_DEMO) {
    if (payload.code.trim() !== DEMO_OTP_HINT) {
      throw new ApiError('Invalid or expired code. Request a new one from the gateway.', 401);
    }

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    return {
      accessToken: 'static-demo-token',
      expiresAt,
    };
  }

  return request<VerifyOtpResult>('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logInteraction(
  blockId: string,
  eventType: string,
  payloadJson: string | null,
  token: string | null,
): Promise<void> {
  if (STATIC_DEMO || !ENABLE_INTERACTION_METRICS) {
    if (import.meta.env.DEV) {
      console.debug('[metrics]', { blockId, eventType, payloadJson });
    }
    return;
  }

  if (!token) {
    return;
  }

  await request<void>(
    '/api/metrics/interaction',
    {
      method: 'POST',
      body: JSON.stringify({ blockId, eventType, payloadJson }),
    },
    token,
  );
}

export async function getHostStats(token: string | null): Promise<HostStats> {
  if (!STATIC_DEMO && USE_HOST_STATS_API && token) {
    return request<HostStats>('/api/host/stats', {}, token);
  }

  const response = await fetch(assetUrl('/fixtures/host-stats.json'));
  if (!response.ok) {
    throw new Error('Failed to load host stats fixture');
  }

  return response.json() as Promise<HostStats>;
}

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResult> {
  if (STATIC_DEMO) {
    throw new ApiError(
      'Admin dashboard requires the live Portfolio.Api. It is unavailable on GitHub Pages.',
      503,
    );
  }

  return request<AdminLoginResult>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOpsReport(token: string): Promise<OpsReport> {
  if (STATIC_DEMO) {
    throw new ApiError('Ops report requires the live API (not available in static demo).', 503);
  }

  return request<OpsReport>('/api/ops/report', {}, token);
}

export { ENABLE_INTERACTION_METRICS, USE_HOST_STATS_API, STATIC_DEMO, DEMO_OTP_HINT };
