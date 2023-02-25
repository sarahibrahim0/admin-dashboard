import { MessageService, ConfirmationService } from 'primeng/api';
import { Location } from '@angular/common';
import { Order } from './../../../models/order';
import { OrdersService } from './../../../services/orders/orders.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';



const orderStatus = {
  0: { label: 'pending', color: 'primary' },
  1: { label: 'processed', color: 'warning' },
  2: { label: 'shipped', color: 'warning' },
  3: { label: 'delivered', color: 'success' },
  4: { label: 'failed', color: 'danger' },
}


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {


  returnedOrder : Order
  orderStatuses = []
  selectedStatus : any
  currentStatus
  constructor(private ActivatedRoute : ActivatedRoute,
    private ordersService : OrdersService,
    private MessageService:  MessageService,
    private ConfirmService : ConfirmationService,
    private router : Router) { }

  ngOnInit(): void {
    this.mapOrderStatus();
    this.getOrderDetails();
  }

  private getOrderDetails(){
    this.ActivatedRoute.params.subscribe((params)=>{
      if(params['id']){
        const id = params['id'];
        this.ordersService.getOrderById(id).subscribe(orderRes=>{
          this.returnedOrder = orderRes;
          this.selectedStatus = orderRes.status

        })

      }
    })
  }

  private mapOrderStatus(){
   this.orderStatuses =   Object.keys(orderStatus).map(key=>{
      return {
        id: key,
        name: orderStatus[key].label
      }
    })
  }


  updateStatus(){
    // const updatedStatus  = $event.value


    this.ConfirmService.confirm({
      message: 'Do you want to update this order status?',
      header: 'update order status',
      icon: 'pi pi-info-circle',
      accept: () => {
        return this.ordersService.editOrderStatus(this.returnedOrder.id ,{ status: this.currentStatus}).subscribe({
             next: (updatedOrder: Order) => {
            this.MessageService.add({ severity: 'success', summary: 'success', detail: `Order Status Is : ${orderStatus[updatedOrder.status].label} ` });
          },
          error: (error) => {
            this.MessageService.add({ severity: 'error', summary: 'error', detail: `Order Status Isn't Updated` });

          }
        })
      },
      reject: (type) => {
      }


    });

  }


  sendStatusName(statusName){
this.currentStatus = statusName;
  }

}
