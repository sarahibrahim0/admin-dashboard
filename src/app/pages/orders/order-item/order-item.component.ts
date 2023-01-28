import { OrderItem } from './../../../models/order-item';
import { Product } from 'src/app/models/product';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Input() orderItem: OrderItem[];

  constructor() { }

  ngOnInit(): void {
  }

}
