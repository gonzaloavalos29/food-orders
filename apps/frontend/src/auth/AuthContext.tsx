import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, setTokenGetter } from '../api/client';
import type { UserDto } from '../api/types';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'food-orders.auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: UserDto; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persist = (u: UserDto, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
  };

  const value: AuthState = useMemo(() => ({
    user,
    token,
    login: async (email, password) => {
      const { user: u, token: t } = await api.auth.login({ email, password });
      persist(u, t);
    },
    register: async (input) => {
      await api.auth.register(input);
      const { user: u, token: t } = await api.auth.login({ email: input.email, password: input.password });
      persist(u, t);
    },
    logout: () => {
      setUser(null); setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
