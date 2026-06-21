import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, setTokenGetter } from './client';

function mockFetch(response: { ok?: boolean; status?: number; body?: unknown }) {
  const { ok = true, status = 200, body = {} } = response;
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body
  } as Response);
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('api client', () => {
  beforeEach(() => {
    setTokenGetter(() => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('performs a GET and returns the parsed body', async () => {
    const fetchMock = mockFetch({ body: { products: [] } });
    const result = await api.products.list();
    expect(result).toEqual({ products: [] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/products');
    expect((init as RequestInit).method).toBeUndefined();
  });

  it('attaches the Authorization header when a token is available', async () => {
    setTokenGetter(() => 'jwt-123');
    const fetchMock = mockFetch({ body: { cart: {} } });
    await api.cart.get();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer jwt-123');
  });

  it('omits the Authorization header when there is no token', async () => {
    const fetchMock = mockFetch({ body: { products: [] } });
    await api.products.list();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('serializes the body and method on writes', async () => {
    const fetchMock = mockFetch({ body: { cart: {} } });
    await api.cart.add({ productId: 'p1', quantity: 2 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/cart/items');
    expect((init as RequestInit).method).toBe('POST');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ productId: 'p1', quantity: 2 });
  });

  it('builds query strings for product filters', async () => {
    const fetchMock = mockFetch({ body: { products: [] } });
    await api.products.list({ category: 'PIZZA', includeUnavailable: true });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('category=PIZZA');
    expect(url).toContain('includeUnavailable=true');
  });

  it('throws an ApiError carrying status and code on failure', async () => {
    mockFetch({
      ok: false,
      status: 401,
      body: { error: { code: 'UNAUTHORIZED', message: 'No autorizado' } }
    });
    await expect(api.auth.me()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'No autorizado'
    });
    await expect(api.auth.me()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns undefined for 204 No Content responses', async () => {
    mockFetch({ status: 204 });
    const result = await api.products.remove('p1');
    expect(result).toBeUndefined();
  });
});
