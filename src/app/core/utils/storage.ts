export function getStorageKey(key: string): string | null {
  return localStorage.getItem(key);
}

export function setStorageKey(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function clearStorageKey(key: string): void {
  localStorage.removeItem(key);
}
