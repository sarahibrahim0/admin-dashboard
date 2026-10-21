import { clearLazyChunkReloadAttempt, recoverFromLazyChunkError } from './lazy-chunk-recovery';

describe('lazy chunk recovery', () => {
  let storage: Storage;
  let reload: jasmine.Spy;

  beforeEach(() => {
    storage = sessionStorage;
    storage.clear();
    reload = jasmine.createSpy('reload');
  });

  afterEach(() => storage.clear());

  it('reloads once when a lazy module is missing', () => {
    expect(
      recoverFromLazyChunkError(
        new TypeError('Failed to fetch dynamically imported module'),
        storage,
        reload,
      ),
    ).toBeTrue();
    expect(reload).toHaveBeenCalledTimes(1);

    expect(
      recoverFromLazyChunkError(
        new TypeError('Failed to fetch dynamically imported module'),
        storage,
        reload,
      ),
    ).toBeFalse();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload for unrelated navigation errors', () => {
    expect(recoverFromLazyChunkError(new Error('Route resolver failed'), storage, reload)).toBeFalse();
    expect(reload).not.toHaveBeenCalled();
  });

  it('allows a future recovery after a successful navigation', () => {
    recoverFromLazyChunkError('ChunkLoadError: Loading chunk failed', storage, reload);
    clearLazyChunkReloadAttempt(storage);

    expect(
      recoverFromLazyChunkError('ChunkLoadError: Loading chunk failed', storage, reload),
    ).toBeTrue();
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
