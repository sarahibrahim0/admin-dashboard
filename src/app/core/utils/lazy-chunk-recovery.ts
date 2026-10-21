const reloadAttemptKey = 'app.lazy-chunk-reload-attempted';
const lazyChunkErrorPattern =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|chunkloaderror/i;

export function recoverFromLazyChunkError(
  error: unknown,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  reload: () => void,
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';
  if (!lazyChunkErrorPattern.test(message)) return false;

  if (storage.getItem(reloadAttemptKey)) return false;
  storage.setItem(reloadAttemptKey, 'true');
  reload();
  return true;
}

export function clearLazyChunkReloadAttempt(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(reloadAttemptKey);
}
