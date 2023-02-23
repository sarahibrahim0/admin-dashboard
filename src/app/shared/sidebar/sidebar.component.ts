import { LoginService } from './../../services/login/login.service';
import { Component, ElementRef, ViewChild , Renderer2 } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  bg : boolean = true;
  data: string
display = true
  constructor(private loginService: LoginService,
    private router: Router
    )

  {}

  logOut(){
    this.loginService.removeToken();
    this.router.navigate(['/login'])

  }

}
