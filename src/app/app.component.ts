import { LoginService } from './services/login/login.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Dashboard';

  constructor(private loginService: LoginService){}
  ngOnInit(){
    // this.loginService.setToken();
  }
}
