const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ApiErrorResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export const COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID ?? '';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;

    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      errorData = undefined;
    }

    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(', ')
      : errorData?.message ??
        `İstek başarısız oldu (${response.status})`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
