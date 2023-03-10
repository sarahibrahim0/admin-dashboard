import { OrderDetailsComponent } from './pages/orders/order-details/order-details.component';
import { CategoriesFormComponent } from 'src/app/pages/categories/categories-form/categories-form.component';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { ProductsListComponent } from './pages/products/products-list/products-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import { UsersListComponent } from './pages/users/users-list/users-list.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { OrdersListComponent } from './pages/orders/orders-list/orders-list.component';
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component';
import { AdminGuard } from './guards/admin.guard';


const routes: Routes = [
  {
    path: '', component: ShellComponent,

       canActivate: [AdminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'categories/form', component: CategoriesFormComponent },
      { path: 'categories/form/:id', component: CategoriesFormComponent },
      { path: 'products',
      component: ProductsListComponent },
      { path: 'product/form', component: ProductFormComponent },
      { path: 'product/form/:id', component: ProductFormComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'user/form', component: UserFormComponent },
      { path: 'user/form/:id', component: UserFormComponent },
      { path: 'orders', component: OrdersListComponent },
      { path: 'orders/:id', component: OrderDetailsComponent },

    ],

  },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sidebar', component: SidebarComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
