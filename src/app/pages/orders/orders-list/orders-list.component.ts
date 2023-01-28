import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrdersService } from './../../../services/orders/orders.service';
import { Order } from './../../../models/order';
import { Component, OnInit } from '@angular/core';


const orderStatus = {
  0: { label: 'pending', color: 'primary' },
  1: { label: 'processed', color: 'warning' },
  2: { label: 'shipped', color: 'warning' },
  3: { label: 'delivered', color: 'success' },
  4: { label: 'failed', color: 'danger' },
}





@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})



export class OrdersListComponent implements OnInit {

  orders: Order[] = []

  order_Status = orderStatus;

  constructor(private OrdersService: OrdersService,
    private ConfirmService: ConfirmationService,
    private MessageService: MessageService,
    private router: Router) { }

  ngOnInit(): void {

    this.getOrders()

  }


  private getOrders() {
    return this.OrdersService.getOrders().subscribe(ordersRes => {
      this.orders = ordersRes
    })
  }


  deleteOrder(orderId: string) {

    this.ConfirmService.confirm({
      message: 'Do you want to delete this Order?',
      header: 'Delete Order',
      icon: 'pi pi-info-circle',
      accept: async() => {
        await this.OrdersService.deleteOrder(orderId).subscribe({
          next:async (order: Order) => {
            this.MessageService.add({ severity: 'success', summary: 'success', detail: `Order Is Deleted` });
            this.getOrders()

          },
          error: (error) => {
            this.MessageService.add({ severity: 'error', summary: 'error', detail:error.error.error});

          }
        })
      },
      reject: (type) => { }
    });
  }





  showOrder(orderId: string) {
  this.router.navigateByUrl(`orders/${orderId}`);
  }
}
