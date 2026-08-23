import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-almond">
      <app-sidebar (collapsed)="collapsed = $event" />
      <div class="flex flex-1 flex-col overflow-hidden" [class.ms-16]="collapsed" [class.ms-64]="!collapsed">
        <app-topbar />
        <main class="flex-1 overflow-y-auto p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  collapsed = false;
}
