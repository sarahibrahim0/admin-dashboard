import { ToggleModeService } from './services/toggle-mode.service';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from './services/login/login.service';
import { Component, Renderer2 } from '@angular/core';
import { SocialUser, GoogleLoginProvider } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'Dashboard';



    constructor(){}

  ngOnInit(){
    // this.loginForm = this.formBuilder.group({
    //   email: ['', Validators.required],
    //   password: ['', Validators.required],
    // });
    // this.socialAuthService.authState.subscribe((user) => {
    //   this.socialUser = user;
    //   this.isLoggedin = user != null;
    //   console.log(this.socialUser);
    // });



  }


  // loginWithGoogle(){

  //     return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
  //       .then(() => this.router.navigateByUrl('/dashboard'));
  //   }
  // logOut(): void {
  //   this.socialAuthService.signOut();
  // }





  }

