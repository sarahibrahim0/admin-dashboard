import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/login.service';

@Component({
  selector: 'app-sidebar-sm',
  templateUrl: './sidebar-sm.component.html',
  styleUrls: ['./sidebar-sm.component.scss']
})
export class SidebarSmComponent implements OnInit {

  constructor(private loginService: LoginService,
    private router: Router
    )

  {}

  logOut(){
    this.loginService.removeToken();
    this.router.navigate(['/login'])

  }

  ngOnInit(): void {
  }



}
