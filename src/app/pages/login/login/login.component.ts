import { Router } from '@angular/router';
import { LoginService } from './../../../services/login/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  loginForm : FormGroup;

  constructor(private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router) { }

  ngOnInit(): void {
    this.initiateForm();
  }

  private initiateForm(){
    this.loginForm = this.formBuilder.group({
      email : ['',[ Validators.required , Validators.email]],
      password: ['', Validators.required]
    })

  }

  login(){




   return this.loginService.login( this.loginForm.controls['email'].value,
   this.loginForm.controls['password'].value).subscribe({next:(user)=>
    {console.log(user);
    this.loginService.setToken(user.token);
    this.router.navigate(['/'])

  }})

  }


}