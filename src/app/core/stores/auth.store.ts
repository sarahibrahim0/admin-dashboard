import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RegisterRequest, User } from '../models';
import { AuthService } from '../services/auth.service';
import { normalizeApiError } from '../services/api-error';
import { clearStorageKey, getStorageKey, setStorageKey } from '../utils/storage';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private auth = inject(AuthService);

  readonly token = signal<string | null>(getStorageKey('ecom.token'));
  readonly refreshToken = signal<string | null>(getStorageKey('ecom.refreshToken'));
  readonly userId = signal<string | null>(getStorageKey('ecom.userId'));
  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isLoggedIn = computed(() => this.token() !== null);
  readonly isAdmin = computed(() => this.user()?.isAdmin === true);

  async login(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(
        this.auth.login(email, password).pipe(
          tap((res) => {
            this.token.set(res.token);
            this.refreshToken.set(res.refreshToken);
            this.userId.set(res.userId);
            setStorageKey('ecom.token', res.token);
            setStorageKey('ecom.refreshToken', res.refreshToken);
            setStorageKey('ecom.userId', res.userId);
          }),
          switchMap((res) => this.auth.me(res.userId)),
          tap((user) => this.user.set(user)),
        ),
      );
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async register(body: RegisterRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.register(body));
      await this.login(body.email, body.password);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    const rt = this.refreshToken();
    if (!rt) return false;
    try {
      const res = await firstValueFrom(this.auth.refresh(rt));
      this.token.set(res.accessToken);
      this.refreshToken.set(res.refreshToken);
      setStorageKey('ecom.token', res.accessToken);
      setStorageKey('ecom.refreshToken', res.refreshToken);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async loadUser(): Promise<void> {
    const id = this.userId();
    if (!id) return;
    try {
      this.user.set(await firstValueFrom(this.auth.me(id)));
    } catch {
      this.user.set(null);
    }
  }

  logout(): void {
    const rt = this.refreshToken();
    if (rt) {
      firstValueFrom(this.auth.logout(rt)).catch(() => {});
    }
    this.token.set(null);
    this.refreshToken.set(null);
    this.userId.set(null);
    this.user.set(null);
    this.error.set(null);
    clearStorageKey('ecom.token');
    clearStorageKey('ecom.refreshToken');
    clearStorageKey('ecom.userId');
  }
}
