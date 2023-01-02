import { ProductsServiceService } from './../../../services/products/products-service.service';
import { Product } from './../../../models/product';
import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../../services/categories/categories-service.service';
import { Location } from '@angular/common';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Category } from 'src/app/models/category';
import { MessageService, ConfirmationService } from 'primeng/api';
import { timer, concatMap } from 'rxjs'
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  form: FormGroup;
  name: string;
  icon: string;
  editMode: boolean = false;
  categories = []

  constructor(private formBuilder: FormBuilder, private CategoriesService: CategoriesService,
    private MessageService: MessageService,
    private location: Location,
    private ActivatedRoute: ActivatedRoute,
    private ConfirmService: ConfirmationService,
    private productService: ProductsServiceService) { }

  ngOnInit() {

    this.getForm();
    this._checkEditMode();
    this.getCategories();


  }

  getForm(){

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      color: ['#fff'],
      description: [''],
      richDescription: [''],
      image: [''],
      images: [''],
      brand: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      rating: [''],
      numReviews: [''],
      isFeatured: [''],
      dateCreated: [''],
    })
  }

  private getCategories(){
    this.CategoriesService.getCategories().subscribe(categoriesArr=>{
      this.categories = categoriesArr;
    })
  }

  onSubmit() {


    const product: Product =
    {
      name: this.form.controls['name'].value,
      image: this.form.controls['image'].value,
      price: this.form.controls['price'].value,
      brand: this.form.controls['brand'].value,
      category: this.form.controls['category'].value,
      countInStock: this.form.controls['countInStock'].value,
      description: this.form.controls['description'].value,
      richDescription: this.form.controls['richDescription'].value,
      images: this.form.controls['images'].value,
      dateCreated: this.form.controls['dateCreated'].value,
      rating: this.form.controls['rating'].value,
      numReviews: this.form.controls['numReviews'].value,
      isFeatured: this.form.controls['isFeatured'].value,



    }
    return this.productService.postProduct(product).subscribe(
      {
        next: (product: Product) => {
          this.MessageService.add({ severity: 'success', summary: 'success', detail: `Product ${product.name} Is Created` });
          timer(1600).subscribe(() => {
            this.location.back()
          })

        },

        error: (error) => {
          this.MessageService.add({ severity: 'error', summary: 'error', detail: 'Product Is Not Created' });

        }

      }

    )
  }

  private _checkEditMode() {
    this.ActivatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        const id = params['id']
        this.productService.getProductById(id).subscribe(resProduct => {

          const product = resProduct;
          if (product) {
            this.form.controls['name'].setValue(resProduct.name);

            this.form.controls['image'].setValue(resProduct.image);

              this.form.controls['price'].setValue(resProduct.price)

              this.form.controls['brand'].setValue(resProduct.brand)

              this.form.controls['category'].setValue(resProduct.category)

              this.form.controls['countInStock'].setValue(resProduct.countInStock)

              this.form.controls['description'].setValue(resProduct.description)

              this.form.controls['richDescription'].setValue(resProduct.richDescription)

              this.form.controls['images'].setValue(resProduct.images)

              this.form.controls['dateCreated'].setValue(resProduct.dateCreated)

              this.form.controls['rating'].setValue(resProduct.rating)

              this.form.controls['numReviews'].setValue(resProduct.numReviews)

              this.form.controls['isFeatured'].setValue(resProduct.isFeatured)


          }


        })
      }
    })
  }


  editSubmit() {

    this.ConfirmService.confirm({
      message: 'Do you want to update this product?',
      header: 'Update Product',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.ActivatedRoute.params.subscribe(params => {
          this.productService.editProduct(params['id'], {

            name: this.form.controls['name'].value,
            image: this.form.controls['image'].value,


          }).subscribe({

            next: (product: Product) => {
              this.MessageService.add({ severity: 'success', summary: 'success', detail: `Category ${product.name} updated` });
            },

            error: (err) => { console.log(err) }


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
