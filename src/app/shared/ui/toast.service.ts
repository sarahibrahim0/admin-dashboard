import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error' | 'info';
  /** Translation key rendered through the translate pipe. */
  key: string;
}

let toastSeq = 0;

/** Tiny global toasts (success/error feedback after actions like delete). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(key: string): void {
    this.push('success', key);
  }

  error(key: string): void {
    this.push('error', key);
  }

  info(key: string): void {
    this.push('info', key);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(kind: Toast['kind'], key: string): void {
    const id = ++toastSeq;
    this.toasts.update((list) => [...list, { id, kind, key }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
