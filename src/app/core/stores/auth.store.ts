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

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private readonly accessTokenLifetimeMs = 15 * 60 * 1000;
  private readonly refreshMarginMs = 3 * 60 * 1000;

  readonly token = signal<string | null>(getStorageKey('ecom.token'));
  readonly refreshToken = signal<string | null>(getStorageKey('ecom.refreshToken'));
  readonly userId = signal<string | null>(getStorageKey('ecom.userId'));
  readonly user = signal<User | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pendingVerificationUserId = signal<string | null>(null);
  readonly pendingVerificationEmail = signal<string | null>(null);
  private persistentSession = true;

  private persist(key: string, value: string): void {
    setStorageKey(key, value, this.persistentSession);
  }

  readonly isLoggedIn = computed(() => this.token() !== null);
  readonly isAdmin = computed(() => this.user()?.isAdmin === true);

  async login(email: string, password: string, keepLoggedIn = true): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.persistentSession = keepLoggedIn;
    try {
      const user = await firstValueFrom(
        this.auth.login(email, password).pipe(
          tap((res) => {
            this.token.set(res.token);
            this.refreshToken.set(res.refreshToken);
            this.userId.set(res.userId);
            this.persist('ecom.token', res.token);
            this.persist('ecom.refreshToken', res.refreshToken);
            this.persist('ecom.userId', res.userId);
          }),
          switchMap((res) => this.auth.me(res.userId)),
          tap((user) => this.user.set(user)),
        ),
      );
      if (!user.isAdmin) {
        this.logout();
        const err: any = new Error('Only admin accounts are allowed to sign in here.');
        err.isAdminError = true;
        throw err;
      }
      this.startTokenRefresh();
    } catch (err: any) {
      if (err?.isAdminError) {
        this.error.set('Only admin accounts are allowed to sign in here.');
        throw err;
      }
      if (err?.status === 403 && err?.error?.userId) {
        this.pendingVerificationUserId.set(err.error.userId);
        this.pendingVerificationEmail.set(email);
        this.error.set(err.error.message || 'Email not verified');
        throw err;
      }
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
      this.persist('ecom.token', res.accessToken);
      this.persist('ecom.refreshToken', res.refreshToken);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  startTokenRefresh(): void {
    this.stopTokenRefresh();
    if (!this.token()) return;
    const intervalMs = Math.max(this.accessTokenLifetimeMs - this.refreshMarginMs, 60 * 1000);
    this.refreshTimer = setInterval(() => {
      if (!this.token()) {
        this.stopTokenRefresh();
        return;
      }
      void this.refreshAccessToken();
    }, intervalMs);
  }

  stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async loadUser(): Promise<void> {
    if (!this.token()) return;
    try {
      this.user.set(await firstValueFrom(this.auth.profile()));
    } catch {
      this.user.set(null);
    }
  }

  logout(): void {
    this.stopTokenRefresh();
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

  async verifyEmail(code: string): Promise<void> {
    const userId = this.pendingVerificationUserId();
    if (!userId) throw new Error('No pending verification');
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.verifyEmail(userId, code));
      this.pendingVerificationUserId.set(null);
      this.pendingVerificationEmail.set(null);
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async resendVerification(): Promise<void> {
    const email = this.pendingVerificationEmail();
    if (!email) throw new Error('No pending verification email');
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.resendVerification(email));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.forgotPassword(email));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.auth.resetPassword(token, password));
    } catch (err) {
      this.error.set(normalizeApiError(err).message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}
