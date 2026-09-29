import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-connectivity-banner',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (connectivity.status() !== 'online') {
      <div
        class="flex items-center justify-center gap-2 px-3 py-2 text-center text-sm font-medium"
        [class.bg-amber-100]="connectivity.status() === 'server-unreachable'"
        [class.text-amber-900]="connectivity.status() === 'server-unreachable'"
        [class.bg-red-100]="connectivity.status() === 'offline'"
        [class.text-red-900]="connectivity.status() === 'offline'"
        role="alert">
        @if (connectivity.status() === 'offline') {
          <span>{{ 'You are offline. Some features will not work until you reconnect.' | translate }}</span>
        } @else {
          <span>{{ 'The server is temporarily unreachable. We will keep trying.' | translate }}</span>
        }
      </div>
    }
  `,
})
export class ConnectivityBannerComponent {
  readonly connectivity = inject(ConnectivityService);
}
