export function getStorageKey(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

export function setStorageKey(key: string, value: string, persistent = true): void {
  (persistent ? localStorage : sessionStorage).setItem(key, value);
}

export function clearStorageKey(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}
