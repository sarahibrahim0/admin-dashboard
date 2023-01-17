import { Router } from '@angular/router';
import { RegisterService } from './../../../services/register/register.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm : FormGroup;

  constructor(private formBuilder: FormBuilder,
    private registerService: RegisterService,
    private router: Router) { }

  ngOnInit(): void {
    this.initiateForm();

  }



  private initiateForm(){
    this.registerForm = this.formBuilder.group({
      email : ['',[ Validators.required , Validators.email]],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      name: ['', Validators.required],
      isAdmin: [false, Validators.required],



    })

  }

  register(){




   return this.registerService.register( {
    email: this.registerForm.controls['email'].value,
   password: this.registerForm.controls['password'].value,
   phone: this.registerForm.controls['phone'].value,
   name: this.registerForm.controls['name'].value,
   isAdmin: this.registerForm.controls['isAdmin'].value}
   ).subscribe({next:(user)=>

    {console.log(user)
      this.router.navigate(['/login'])


    }})

  }


}
