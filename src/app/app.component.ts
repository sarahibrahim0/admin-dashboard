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

  loginForm!: FormGroup;
  socialUser!: SocialUser;
  isLoggedin?: boolean = false
  mode: string


  title = 'Dashboard';




  obsMode

theme: string = 'bootstrap';

    constructor(
    private loginService: LoginService,
    private router : Router,
    private formBuilder: FormBuilder,
    private socialAuthService: SocialAuthService,
    private Renderer2: Renderer2,
    private ToggleModeService: ToggleModeService){}

  ngOnInit(){
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.socialAuthService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
      console.log(this.socialUser);
    });







    // this.obsMode=  this.ToggleModeService.themeChanges();

    // this.obsMode.subscribe(theme => {
    //    if (theme.oldValue) {
    //      this.Renderer2.removeClass(document.body, theme.oldValue);
    //    }
    //    this.Renderer2.addClass(document.body, theme.newValue);
    //  })
  }
  loginWithGoogle(){

      return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
        .then(() => this.router.navigateByUrl('/dashboard'));
    }
  logOut(): void {
    this.socialAuthService.signOut();
  }



  // toggleTheme() {
  //   if (this.theme === 'bootstrap') {
  //     this.theme = 'bootstrap-dark';
  //   } else  {
  //     this.theme = 'bootstrap';
  //   }

  //   this.ToggleModeService.setTheme(this.theme)
  // }


  }

