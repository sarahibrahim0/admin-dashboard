import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {



  api = `${environment.apiUrl}users`

  constructor(private http: HttpClient) { }

  getCategories() {
    return this.http.get(`${this.api}`);
  }

  getCategoryById(id: string){
    return this.http.get(`${this.api}/${id}`);
  }

  postCategories(user){
    return this.http.post(`${this.api}`, user);
  }

  deleteCategories(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  editCategories( id : string , user ){
    return this.http.put(`${this.api}/${id}`, user);
  }

}
