import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the API layer so the context is tested in isolation from the network.
vi.mock('../api/client', () => ({
  setTokenGetter: vi.fn(),
  api: {
    auth: {
      login: vi.fn(),
      register: vi.fn()
    }
  }
}));

import { api } from '../api/client';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const fakeUser = { id: 'u1', email: 'a@b.com', name: 'Ana', role: 'CUSTOMER' as const, createdAt: '2026-01-01' };

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('useAuth throws when used outside of an AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
    spy.mockRestore();
  });

  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('login stores the user and token and persists them', async () => {
    (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValue({ user: fakeUser, token: 'jwt-1' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('a@b.com', 'secret');
    });

    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.token).toBe('jwt-1');
    const stored = JSON.parse(localStorage.getItem('food-orders.auth')!);
    expect(stored.token).toBe('jwt-1');
  });

  it('register logs the user in afterwards', async () => {
    (api.auth.register as ReturnType<typeof vi.fn>).mockResolvedValue({ user: fakeUser });
    (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValue({ user: fakeUser, token: 'jwt-2' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({ email: 'a@b.com', password: 'secret', name: 'Ana' });
    });

    expect(api.auth.register).toHaveBeenCalledOnce();
    expect(result.current.token).toBe('jwt-2');
  });

  it('logout clears state and storage', async () => {
    (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValue({ user: fakeUser, token: 'jwt-1' });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('a@b.com', 'secret');
    });
    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('food-orders.auth')).toBeNull();
  });

  it('restores a persisted session on mount', async () => {
    localStorage.setItem('food-orders.auth', JSON.stringify({ user: fakeUser, token: 'jwt-restored' }));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.token).toBe('jwt-restored'));
    expect(result.current.user).toEqual(fakeUser);
  });

  it('discards a corrupt persisted session on mount', async () => {
    localStorage.setItem('food-orders.auth', '{ not valid json');
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(localStorage.getItem('food-orders.auth')).toBeNull());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
