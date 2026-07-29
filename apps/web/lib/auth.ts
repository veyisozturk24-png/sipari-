export const AUTH_STORAGE_KEY = "siparis_auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  companyMemberships: Array<{
    role: string;
    company: { id: string; name: string; slug: string };
  }>;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getActiveCompanyId() {
  return getSession()?.user.companyMemberships[0]?.company.id ?? process.env.NEXT_PUBLIC_COMPANY_ID;
}
