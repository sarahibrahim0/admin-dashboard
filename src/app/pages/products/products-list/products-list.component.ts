import { Product } from './../../../models/product';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  products: Product[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  editProduct(ProductId: string) { }
  
  deleteProduct(ProductId: string) { }

}
