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
  categories : Category [] = [];
  src: string | ArrayBuffer
  isSubmitted : boolean = false;
  categoryId : string
  currentProduct : Product

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

  private getForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      description: [''],
      richDescription: [''],
      image: ['', Validators.required],
      isFeatured: [false]
    })
  }

  private getCategories() {
    this.CategoriesService.getCategories().subscribe(categoriesArr => {
      this.categories = categoriesArr;
    })
  }


  private addProduct(productForm : FormData){

    return this.productService.postProduct(productForm).subscribe(
      {
        next: (product: Product) => {
          this.MessageService.add({ severity: 'success', summary: 'success', detail: `Product ${product.name} Is Created` });
          timer(1600).subscribe(() => {
            this.location.back()
          })

        },

        error: (error) => {
          this.MessageService.add({ severity: 'error', summary: 'error', detail: error.error });

        }

      }

    )
  }




  onSubmit() {

    console.log(this.categoryId);
    console.log(this.productForm['category'].value)

    this.isSubmitted = true;
    if(this.productForm['category'].value !== this.categoryId && this.categoryId !== undefined ){
      this.form.controls['category'].setValue(this.categoryId);
    }
  const productFormData = new FormData();
 Object.keys(this.productForm).map((key) => {
  productFormData.append(key, this.productForm[key].value);
  })

  this.addProduct(productFormData);


  }




  private _checkEditMode() {
    this.ActivatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        const id = params['id']
        this.productService.getProductById(id).subscribe(resProduct => {
        // this.CategoriesService.getCategoryById()
          const product = resProduct;
          if (product) {

            this.currentProduct = product;

            this.form.controls['name'].setValue(resProduct.name);
            this.form.controls['price'].setValue(resProduct.price)
            this.form.controls['brand'].setValue(resProduct.brand)
            this.form.controls['category'].setValue(resProduct.category?._id)
            this.form.controls['countInStock'].setValue(resProduct.countInStock)
            // this.form.controls['description'].setValue(resProduct.description)
            this.form.controls['richDescription'].setValue(resProduct.richDescription)
            // this.form.controls['images'].setValue(resProduct.images)
            // this.form.controls['dateCreated'].setValue(resProduct.dateCreated)
            // this.form.controls['rating'].setValue(resProduct.rating)
            // this.form.controls['numReviews'].setValue(resProduct.numReviews)
            this.form.controls['isFeatured'].setValue(resProduct.isFeatured)
            this.src = resProduct.image
            this.productForm['image'].setValidators([]);
            this.productForm['image'].updateValueAndValidity();




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



        console.log(this.categoryId);
        console.log(this.productForm['category'].value)
if(this.productForm['category'].value !== this.categoryId && this.categoryId !== undefined ){
  console.log(this.categoryId);
  console.log(this.productForm['category'].value)
  this.form.controls['category'].setValue(this.categoryId)
}

  this.ActivatedRoute.params.subscribe(params => {
  const productFormData = new FormData();
  Object.keys(this.productForm).map((key) => {
   productFormData.append(key, this.productForm[key].value);
   })

          this.productService.editProduct(params['id'],
        productFormData

          ).subscribe({

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


sendId(id){
this.categoryId = id;
}

  onUpload(event) {
    const file = event.target.files[0]
    if (file) {
      this.form.patchValue({'image' : file});
      this.form.get('image').updateValueAndValidity;

      const fileReader = new FileReader();
      fileReader.onload = () => {  //after the file is read successfully
        this.src = fileReader.result
      }
      fileReader.readAsDataURL(file);
    }
  }



  onCancel() {
    this.location.back()

  }


  get productForm() {
    return this.form.controls;
  }

}
