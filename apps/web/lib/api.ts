const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      cache: "no-store",
      ...options,
    },
  );

  if (!response.ok) {
    let message = "API isteği başarısız.";

    try {
      message = await response.text();
    } catch {
      // Varsayılan mesaj kullanılacak.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}