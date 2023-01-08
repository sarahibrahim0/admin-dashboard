import { OrdersService } from './../../../services/orders/orders.service';
import { Order } from './../../../models/order';
import { Component, OnInit } from '@angular/core';


const orderStatus ={
0 :{label: 'pending', color : 'primary'},
1 :{label: 'processed', color : 'warning'},
2 :{label: 'shipped', color : 'warning'},
3 :{label: 'delivered', color : 'success'},
4 :{label: 'failed', color : 'danger'},
}


@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})



export class OrdersListComponent implements OnInit {

  orders : Order[] = []

  order_status = orderStatus;

  constructor(private OrdersService : OrdersService) { }

  ngOnInit(): void {

    this.showOrder()

  }

  deleteOrder(){}

  showOrder(){
   return this.OrdersService.getOrders().subscribe(ordersRes=>{
      this.orders = ordersRes
    })
  }
}
