import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ShellComponent } from './shared/shell/shell.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoriesFormComponent } from './pages/categories-form/categories-form.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ShellComponent,
    CategoriesComponent,
    CategoriesFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
