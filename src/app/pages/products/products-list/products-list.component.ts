import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ProductsServiceService } from './../../../services/products/products-service.service';
import { Product } from './../../../models/product';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];

  constructor(private productService : ProductsServiceService ,
    private router : Router,
    private ConfirmService: ConfirmationService,
    private MessageService: MessageService) { }

  ngOnInit(): void {

    this.getProducts();

  }

  getProducts(){
    this.productService.getProducts().subscribe(products=>{
      this.products = products;
    })
  }

  editProduct(ProductId: string) {
  this.router.navigateByUrl(`product/form/${ProductId}`)
  }



  deleteProduct(ProductId: string) {
    console.log('hi')

    this.ConfirmService.confirm({
      message: 'Do you want to delete this product?',
      header: 'Delete Product',
      icon: 'pi pi-info-circle',
      accept: () => {
        return this.productService.deleteProduct(ProductId).subscribe({
          next: (product: Product) => {
            this.MessageService.add({ severity: 'success', summary: 'success', detail: `Product ${product.name} Is Deleted` });
            this.getProducts()

          },
          error: (error) => {
            this.MessageService.add({ severity: 'error', summary: 'error', detail: 'Product Is Not Deleted' });

          }
        })
      },
      reject: (type) => {

      }


    });
  }


}
