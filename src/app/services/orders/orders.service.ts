import { Observable } from 'rxjs';
import { Order } from './../../models/order';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient) { }

  api = `${environment.apiUrl}orders`

  postOrder(order: Order) : Observable<Order> {
    return this.http.post<Order>(`${this.api}`, order);
  }

  getOrders() : Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.api}/${id}`);
  }

  deleteOrder(id: string): Observable<Order> {
    return this.http.delete<Order>(`${this.api}/${id}`);
  }

  editOrder(id: string , order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.api}/${id}`, order);
  }
}
