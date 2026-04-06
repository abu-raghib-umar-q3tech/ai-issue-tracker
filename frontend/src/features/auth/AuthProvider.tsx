import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useDispatch } from 'react-redux';
import { AUTH_SESSION_EVENT, clearStoredSession, getStoredSession, setStoredSession } from './authStorage';
import { baseApi } from '../../services/baseApi';
import type { AuthSession, AuthUser } from './types';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useDispatch();
  const [session, setSessionState] = useState<AuthSession | null>(() => getStoredSession());

  const setSession = (nextSession: AuthSession): void => {
    setStoredSession(nextSession);
    setSessionState(nextSession);
  };

  const logout = (): void => {
    clearStoredSession();
    setSessionState(null);
    dispatch(baseApi.util.resetApiState());
  };

  useEffect(() => {
    const syncSession = () => {
      setSessionState(getStoredSession());
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isAdmin: session?.user.role === 'admin',
      setSession,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export { AuthProvider, useAuth };
