import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginService } from './../../../services/login/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  loginForm : FormGroup;
  error : string

  constructor(private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private MessageService: MessageService ) { }

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
    this.MessageService.add({ severity: 'success', summary: 'Success', detail: `You Are Logged In` });

    timer(1600).subscribe(() => {
      this.router.navigate(['/dashboard'])
    })


  },
  error:(error)=>{

    this.error = error.message
    this.MessageService.add({ severity: 'error', summary: 'Wrong Info', detail: `Sorry, Couldn't Log In` });



}})

  }


  clear(){
    this.error = null;
  }


}