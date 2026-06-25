const TOKEN_KEY = 'portfolio.accessToken';
const EXPIRES_KEY = 'portfolio.expiresAt';
const EMAIL_KEY = 'portfolio.pendingEmail';

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
}

export function getToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);

  if (!token || !expiresAt) {
    return null;
  }

  if (new Date(expiresAt) <= new Date()) {
    clearAuth();
    return null;
  }

  return token;
}

export function getSession(): AuthSession | null {
  const accessToken = getToken();
  const expiresAt = sessionStorage.getItem(EXPIRES_KEY);

  if (!accessToken || !expiresAt) {
    return null;
  }

  return { accessToken, expiresAt };
}

export function setSession(session: AuthSession): void {
  sessionStorage.setItem(TOKEN_KEY, session.accessToken);
  sessionStorage.setItem(EXPIRES_KEY, session.expiresAt);
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function setPendingEmail(email: string): void {
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function getPendingEmail(): string | null {
  return sessionStorage.getItem(EMAIL_KEY);
}

export function clearPendingEmail(): void {
  sessionStorage.removeItem(EMAIL_KEY);
}
