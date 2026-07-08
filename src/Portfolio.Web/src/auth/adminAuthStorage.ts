const ADMIN_TOKEN_KEY = 'portfolio.adminToken';
const ADMIN_EXPIRES_KEY = 'portfolio.adminExpiresAt';

export interface AdminSession {
  accessToken: string;
  expiresAt: string;
}

export function getAdminToken(): string | null {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(ADMIN_EXPIRES_KEY);

  if (!token || !expiresAt) {
    return null;
  }

  if (new Date(expiresAt) <= new Date()) {
    clearAdminAuth();
    return null;
  }

  return token;
}

export function getAdminSession(): AdminSession | null {
  const accessToken = getAdminToken();
  const expiresAt = sessionStorage.getItem(ADMIN_EXPIRES_KEY);

  if (!accessToken || !expiresAt) {
    return null;
  }

  return { accessToken, expiresAt };
}

export function setAdminSession(session: AdminSession): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, session.accessToken);
  sessionStorage.setItem(ADMIN_EXPIRES_KEY, session.expiresAt);
}

export function clearAdminAuth(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_EXPIRES_KEY);
}

export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}
