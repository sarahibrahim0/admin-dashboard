import { JwtHelperService } from '@auth0/angular-jwt';
import {SidebarModule} from 'primeng/sidebar';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NgModule, Renderer2, RendererFactory2 } from '@angular/core';
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
import {CardModule} from 'primeng/card';
import {FieldsetModule} from 'primeng/fieldset';
import { LoginComponent } from './pages/login/login/login.component';
import { RegisterComponent } from './pages/register/register/register.component';
import { AdminInterceptor } from './interceptors/admin.interceptor';
import { OnClickBgDirective } from './directives/on-click-bg.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from "primeng/button";
import { OrderItemComponent } from './pages/orders/order-item/order-item.component';
import { SocialLoginModule,
  SocialAuthServiceConfig} from '@abacritt/angularx-social-login'
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { ToggleModeComponent } from './shared/toggle-mode/toggle-mode.component';
import { SidebarSmComponent } from './shared/sidebar-sm/sidebar-sm.component';
import { GalleriaModule } from 'primeng/galleria';













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
    OrderItemComponent,
    ToggleModeComponent,
    SidebarSmComponent,
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
CardModule,
FieldsetModule,
NgbModule,
ButtonModule,
SocialLoginModule,
SidebarModule,
GalleriaModule
  ]

  ,
  providers: [MessageService, ConfirmationService,
    {provide: HTTP_INTERCEPTORS, useClass: AdminInterceptor ,  multi: true},
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('7014429512-6k4317v3shsosgmg0d7umfmun902km2m.apps.googleusercontent.com'),
          },
        ],
      } as SocialAuthServiceConfig,
    },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
