import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  products: [] = [];

  constructor() { }

  ngOnInit(): void {
  }

  editProduct(ProductId: string) { }
  deleteProduct(ProductId: string) { }

}
