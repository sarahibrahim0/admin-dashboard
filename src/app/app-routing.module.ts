import { CategoriesFormComponent } from 'src/app/pages/categories-form/categories-form.component';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '', component: ShellComponent, children: [

      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'categories/form', component: CategoriesFormComponent },
      { path: 'categories/form/:id', component: CategoriesFormComponent }



    ]
  },
  { path: 'sidebar', component: SidebarComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
