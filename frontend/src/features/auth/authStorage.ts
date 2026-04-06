import type { AuthSession, AuthUser } from './types';

const TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'authUser';
const AUTH_SESSION_EVENT = 'auth:session-changed';

const isBrowser = typeof window !== 'undefined';

const notifySessionChanged = (): void => {
  if (!isBrowser) {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT));
};

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (candidate.role === 'user' || candidate.role === 'admin')
  );
};

const clearStoredSessionSilently = (): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getStoredToken = (): string | null => {
  if (!isBrowser) {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const getStoredSession = (): AuthSession | null => {
  if (!isBrowser) {
    return null;
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userRaw = localStorage.getItem(USER_STORAGE_KEY);

  if (!token || !userRaw) {
    clearStoredSessionSilently();
    return null;
  }

  try {
    const parsedUser = JSON.parse(userRaw) as unknown;

    if (!isAuthUser(parsedUser)) {
      clearStoredSessionSilently();
      return null;
    }

    return {
      token,
      user: parsedUser
    };
  } catch (_error: unknown) {
    clearStoredSessionSilently();
    return null;
  }
};

export const setStoredSession = (session: AuthSession): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  notifySessionChanged();
};

export const clearStoredSession = (): void => {
  clearStoredSessionSilently();
  notifySessionChanged();
};

export { AUTH_SESSION_EVENT, TOKEN_STORAGE_KEY, USER_STORAGE_KEY };
