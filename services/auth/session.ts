const ACCESS_TOKEN_STORAGE_KEY = "devflow.access_token";

function getStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
}

export function setAccessToken(accessToken: string): void {
  getStorage()?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function clearAccessToken(): void {
  getStorage()?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
