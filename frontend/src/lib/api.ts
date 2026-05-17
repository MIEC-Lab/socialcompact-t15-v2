export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function normalizeApiBaseUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmedValue.endsWith("/")
    ? trimmedValue.slice(0, -1)
    : trimmedValue;
}

export function getPublicApiBaseUrl() {
  return normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
  );
}

export function getServerApiBaseUrl() {
  return normalizeApiBaseUrl(
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  );
}

export function isLocalApiBaseUrl(value: string) {
  try {
    const url = new URL(normalizeApiBaseUrl(value));
    return LOCAL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
