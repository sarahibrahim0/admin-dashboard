import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsServiceService {

  constructor(private http: HttpClient) { }

  api = `${environment.apiUrl}products`

  postProduct(product : FormData) : Observable<Product> {
    return this.http.post<Product>(`${this.api}`, product);
  }

  getProducts() : Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.api}/${id}`);
  }

  editProduct(id: string , product: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.api}/${id}`, product);
  }


}
