import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NavigationEnd, Router, provideRouter, withComponentInputBinding, withNavigationErrorHandler } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { filter } from 'rxjs';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { networkInterceptor } from './core/interceptors/network.interceptor';
import { AuthStore } from './core/stores/auth.store';
import { clearLazyChunkReloadAttempt, recoverFromLazyChunkError } from './core/utils/lazy-chunk-recovery';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(({ error }) => {
        recoverFromLazyChunkError(error, sessionStorage, () => window.location.reload());
      }),
    ),
    // networkInterceptor first: it must see the raw HttpErrorResponse before
    // authInterceptor normalizes it into a plain ApiError.
    provideHttpClient(withInterceptors([networkInterceptor, authInterceptor])),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      inject(AuthStore).startTokenRefresh();
      inject(Router).events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        clearLazyChunkReloadAttempt(sessionStorage);
      });
    }),
    providePrimeNG({
      license: 'eyJpZCI6ImI0MWE3MWEzLWQ0MTMtNDUwOS1iZTk0LTIxYzYwOTc1ZTg3OSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODc1MjY3NTIsImV4cCI6MTgxOTA2Mjc1Mn0.U0-FyyJmmzTefFQVUv6Wuo8fTllpEWRfjUFNXYc2tGyZUxkOJ9RWYznvIU7J0davVH30qCGqvKb6qzKpRNOaBQ',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
