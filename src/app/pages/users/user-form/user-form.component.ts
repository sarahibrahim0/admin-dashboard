import { timer, BehaviorSubject } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { User } from './../../../models/user';
import { Location } from '@angular/common';
import { UsersService } from './../../../services/users/users.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import * as countriesList from 'i18n-iso-countries'

declare function require(name:string);


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  form: FormGroup;
  editMode: boolean = false;
  countries = [];
  currentUser : User;
  countryName : string
  adminValue : boolean
  countryAdmin
  userCountry : BehaviorSubject<any> = new BehaviorSubject<any>(null);


  constructor(private formBuilder: FormBuilder,
    private ActivatedRoute: ActivatedRoute,
    private userService: UsersService,
    private Location: Location,
    private ConfirmService: ConfirmationService,
    private MessageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.initiateForm();
    this._checkEditMode();
    this.getCountries();

  }

  private initiateForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      isAdmin: ['', Validators.required],
      country: [''],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      apartment: [''],
      street: [''],
      city: [''],
      zipCode: ['']
    })
  }



  private _checkEditMode() {

    this.ActivatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        const id = params['id']
        this.userService.getUserById(id).subscribe(resUser => {
          const user = resUser;
          if (user) {

            // if(user.isAdmin === true){
            //   this.adminValue = true;
            // }
            // else{
            //   this.adminValue = false;
            // }


            this.currentUser = user;
            this.form.controls['name'].setValue(resUser.name);
            this.form.controls['email'].setValue(resUser.email);
            this.form.controls['isAdmin'].setValue(resUser.isAdmin);
            this.form.controls['country'].setValue(resUser.country);
            // this.userCountry.next(this.userForm['country'].value)
            this.form.controls['password'].setValidators([]);
            this.form.controls['password'].updateValueAndValidity;
            this.form.controls['phone'].setValue(resUser.phone);
            this.form.controls['apartment'].setValue(resUser.apartment);
            this.form.controls['city'].setValue(resUser.city);
            this.form.controls['street'].setValue(resUser.street);
            this.form.controls['zipCode'].setValue(resUser.zip);
          }

        })
      }
    })


  }

  onSubmit() {

    const user = {
      name: this.form.controls['name'].value,
      email: this.form.controls['email'].value,
      isAdmin: this.form.controls['isAdmin'].value,
      password: this.form.controls['password'].value,
      phone: this.form.controls['phone'].value,
      city: this.form.controls['city'].value,
      street: this.form.controls['street'].value,
      apartment: this.form.controls['phone'].value,
      zipCode: this.form.controls['zipCode'].value,
      country: this.form.controls['country'].value,
    }

    return this.userService.postUser(user).subscribe(
      {
        next: (user: User) => {
          this.MessageService.add({ severity: 'success', summary: 'success', detail: `User ${user.name} Is Created` });
          timer(1600).subscribe(() => {
            this.Location.back()
          })

        },

        error: (error) => {
          this.MessageService.add({ severity: 'error', summary: 'error', detail: error.error });

        }

      }

    )

  }

  editSubmit() {



    this.ConfirmService.confirm({
      message: 'Do you want to update this user?',
      header: 'Update User',
      icon: 'pi pi-info-circle',
      accept: () => {

        this.userCountry.subscribe(value=>{
        this.countryAdmin = value
        // this.form.controls['country'].setValue(this.countryAdmin);
        })

        // this.sendCountryName();
        console.log(this.userForm['name'].value);


       if (this.userForm['country'].value !== this.countryName && this.countryName !== undefined ){
        this.form.controls['country'].setValue(this.countryName);
       }
        this.ActivatedRoute.params.subscribe(params => {
          this.userService.editUser(params['id'],
            {
              name: this.form.controls['name'].value,
              email: this.form.controls['email'].value,
              isAdmin: this.form.controls['isAdmin'].value,
              country: this.form.controls['country'].value,
              password: this.form.controls['password'].value,
              phone: this.form.controls['phone'].value,
              apartment: this.form.controls['apartment'].value,
              city: this.form.controls['city'].value,
              street: this.form.controls['street'].value,
              zip: this.form.controls['zipCode'].value,

            }

          ).subscribe({

            next: (user: User) => {
              this.MessageService.add({ severity: 'success', summary: 'success', detail: `User ${user.name} updated` });
            },

            error: (error) => {
              this.MessageService.add({ severity: 'error', summary: 'error', detail: error.error });

            }

          })
        })
      },
      reject: (type) => {

      }


    })

  }






  onCancel() {
    this.Location.back();
  }

  private getCountries(){
  countriesList.registerLocale(require("i18n-iso-countries/langs/en.json"));
 this.countries = Object.entries(countriesList.getNames("en", {select: "official"})).map(country=>{

return {
  id : country[0],
  name : country[1]
}
  })
  }





  sendCountryName(countryName){

this.countryName = countryName;
  }

  get userForm (){
    return this.form.controls;
  }
}
