const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function getAccessToken() {
  if (typeof window === 'undefined') return undefined;

  try {
    return JSON.parse(
      window.localStorage.getItem('siparis_auth') ?? '{}',
    ).accessToken as string | undefined;
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(options?.headers);

  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'API isteği başarısız.';

    try {
      message = await response.text();
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
