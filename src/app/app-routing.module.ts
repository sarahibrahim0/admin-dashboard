import { CategoriesFormComponent } from './pages/categories/categories-form/categories-form.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '', component: ShellComponent, children: [
      {path:'dashboard',component:DashboardComponent},
      { path: 'categories', component: CategoriesComponent },
      { path: 'categories/form', component: CategoriesFormComponent }


    ]
  },
  { path: 'sidebar', component: SidebarComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
