import { CategoriesService } from '../../../services/categories/categories-service.service';
import { Component, Injectable } from '@angular/core';
import { Location } from '@angular/common';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Category } from 'src/app/models/category';
import { MessageService, ConfirmationService } from 'primeng/api';
import { timer, concatMap } from 'rxjs'
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})

export class CategoriesFormComponent {
  form: FormGroup;
  name: string;
  icon: string;
  editMode: boolean = false;


  constructor(private formBuilder: FormBuilder, private CategoriesService: CategoriesService,
    private MessageService: MessageService,
    private location: Location,
    private ActivatedRoute: ActivatedRoute,
    private ConfirmService: ConfirmationService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      color: ['#fff']
    })

    this._checkEditMode()
    // this.editSubmit()

  }

  onSubmit() {


    const category: Category =
    {
      name: this.form.controls['name'].value,
      icon: this.form.controls['icon'].value,
      color: this.form.controls['color'].value


    }
    return this.CategoriesService.postCategories(category).subscribe(
      {
        next: (category: Category) => {
          this.MessageService.add({ severity: 'success', summary: 'success', detail: `Category ${category.name} Is Created` });
          timer(1600).subscribe(() => {
            this.location.back()
          })

        },

        error: (error) => {
          this.MessageService.add({ severity: 'error', summary: 'error', detail:`Category Isn't Created` });

        }

      }

    )
  }

  private _checkEditMode() {
    this.ActivatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        const id = params['id']
        this.CategoriesService.getCategoryById(id).subscribe(resCategory => {

          const category = resCategory;
          if (category) {
            this.form.controls['name'].setValue(resCategory.name);
            this.form.controls['icon'].setValue(resCategory.icon);
            this.form.controls['color'].setValue(resCategory.color);


          }


        })
      }
    })
  }


  editSubmit() {

    this.ConfirmService.confirm({
      message: 'Do you want to update this category?',
      header: 'Update Category',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.ActivatedRoute.params.subscribe(params => {
          this.CategoriesService.editCategories(params['id'], {

            name: this.form.controls['name'].value,
            icon: this.form.controls['icon'].value,
            color: this.form.controls['color'].value,


          }).subscribe({

            next: (category: Category) => {
              this.MessageService.add({ severity: 'success', summary: 'success', detail: `Category ${category.name} Is Updated` });
            },

            error: (err) => {
              this.MessageService.add({ severity: 'error', summary: 'error', detail: `Category  Isn't Updated` });

             }


          })
        })
      },
      reject: (type) => {

      }


    })

  }

  onCancel() {
    this.location.back()

  }

}