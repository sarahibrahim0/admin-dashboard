import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p class="mt-2 text-slate-600">Welcome to the admin dashboard.</p>
    </div>
  `,
})
export class DashboardComponent {}
