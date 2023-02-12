import { ToggleModeService } from './../../services/toggle-mode.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, OnInit , Renderer2} from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  productsCount: number
  usersCount: number
  ordersCount : number
  totalSales : number



  constructor(private http : HttpClient, private ToggleModeService: ToggleModeService, private Renderer2: Renderer2) { }

  ngOnInit(): void {
    this.getProducts();
    this.getUsers();
    this.getOrders();
    this.getTotalSales();
    this.getViews()

    }


  private getProducts(){

    return this.http.get(`${environment.apiUrl}products/get/count`).subscribe(count=>{
      this.productsCount = count['productCount'];
    })

  }


  private getUsers(){

    return this.http.get(`${environment.apiUrl}users/get/count`).subscribe(count=>{
      this.usersCount = count['userCount'];
    })

  }



  private getOrders(){

    return this.http.get(`${environment.apiUrl}orders/get/count`).subscribe(count=>{
      this.ordersCount = count['orderCount'];
    })

  }


  private getTotalSales(){

    return this.http.get(`${environment.apiUrl}orders/get/totalsales`).subscribe(count=>{
      this.totalSales = count['totalsales'];
    })

  }

  private getViews(){
   return this.http.get(`http://localhost:3000/api/v1/session`).subscribe(result=>{


  })
  }


}
