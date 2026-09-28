import { signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/**
 * Shared "latest wins" loader for server-side tables.
 *
 * Starting a new load aborts the previous in-flight HTTP request, so rapid
 * search / sort / filter / pagination changes can never pile up duplicate
 * requests — and a slow earlier response can never overwrite fresher data.
 * (switchMap semantics for the imperative loadX() pattern used by list pages.)
 *
 * Usage per list page (one field + wrap the subscribe):
 *   private loader = new LatestLoader();
 *   loadProducts(page = this.currentPage): void {
 *     this.loader.load(
 *       this.entityService.listPaginated<any>('products', this.buildParams(page)),
 *       (res) => { this.products.set(res.data); this.totalCount.set(res.total); },
 *     );
 *   }
 */
export class LatestLoader {
  private current?: Subscription;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load<T>(request: Observable<T>, next: (value: T) => void, onError?: (err: any) => void): void {
    this.current?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.current = request.subscribe({
      next: (value) => {
        this.loading.set(false);
        next(value);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.message || 'Failed to load data');
        onError?.(err);
      },
    });
  }

  cancel(): void {
    this.current?.unsubscribe();
    this.current = undefined;
    this.loading.set(false);
  }
}
