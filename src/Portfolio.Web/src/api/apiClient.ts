const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ENABLE_INTERACTION_METRICS = import.meta.env.VITE_ENABLE_INTERACTION_METRICS === 'true';
const USE_HOST_STATS_API = import.meta.env.VITE_USE_HOST_STATS_API === 'true';

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
  return request<HealthResponse>('/health');
}

export async function requestAccess(payload: RequestAccessPayload): Promise<RequestAccessResult> {
  return request<RequestAccessResult>('/api/auth/request-access', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
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
  if (!ENABLE_INTERACTION_METRICS) {
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
  if (USE_HOST_STATS_API && token) {
    return request<HostStats>('/api/host/stats', {}, token);
  }

  const response = await fetch('/fixtures/host-stats.json');
  if (!response.ok) {
    throw new Error('Failed to load host stats fixture');
  }

  return response.json() as Promise<HostStats>;
}

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResult> {
  return request<AdminLoginResult>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOpsReport(token: string): Promise<OpsReport> {
  return request<OpsReport>('/api/ops/report', {}, token);
}

export { ENABLE_INTERACTION_METRICS, USE_HOST_STATS_API };
