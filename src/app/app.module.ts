import { JwtHelperService } from '@auth0/angular-jwt';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShellComponent } from './shared/shell/shell.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriesFormComponent } from 'src/app/pages/categories/categories-form/categories-form.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TableModule } from 'primeng/table';
import { ProductsListComponent } from './pages/products/products-list/products-list.component';
import { ProductFormComponent } from './pages/products/product-form/product-form.component';
import {InputNumberModule} from 'primeng/inputnumber';
import {DropdownModule} from 'primeng/dropdown';
import {EditorModule} from 'primeng/editor';
import { UsersListComponent } from './pages/users/users-list/users-list.component';
import { UserFormComponent } from './pages/users/user-form/user-form.component';
import { OrdersListComponent } from './pages/orders/orders-list/orders-list.component';
import { OrderDetailsComponent } from './pages/orders/order-details/order-details.component';
import { TagModule } from 'primeng/tag';
import {CardModule} from 'primeng/card';
import {FieldsetModule} from 'primeng/fieldset';
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component';
import { AdminInterceptor } from './interceptors/admin.interceptor';
import { OnClickBgDirective } from './directives/on-click-bg.directive';















@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ShellComponent,
    DashboardComponent,
    CategoriesComponent,
    CategoriesFormComponent,
    ProductsListComponent,
    ProductFormComponent,
    UsersListComponent,
    UserFormComponent,
    OrdersListComponent,
    OrderDetailsComponent,
    LoginComponent,
    RegisterComponent,
    OnClickBgDirective,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ColorPickerModule,
    InputNumberModule,
    DropdownModule,
EditorModule,
TagModule,
CardModule,
FieldsetModule
  ]

  ,
  providers: [MessageService, ConfirmationService,
    {provide: HTTP_INTERCEPTORS, useClass: AdminInterceptor ,  multi: true},

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
