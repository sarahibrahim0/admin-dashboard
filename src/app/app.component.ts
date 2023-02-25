
import { Component} from '@angular/core';

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

