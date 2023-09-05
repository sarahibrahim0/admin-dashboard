import { BehaviorSubject, Observable, observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  api = `${environment.apiUrl}users/login`

  $token : BehaviorSubject<string> = new BehaviorSubject<string>(this.getToken())
  $user : BehaviorSubject<any> = new BehaviorSubject<any>(0)

  constructor(private http : HttpClient) {
   }
  login(email: string , password: string) : Observable<User>
  {
   return this.http.post<any>(`${this.api}`, { email,  password})
  }

  setToken(data){
    localStorage.setItem('Token', data);
  }

  getToken(){
  return localStorage.getItem('Token');
  }

  removeToken(){
    localStorage.removeItem('Token');
  }

  getUserById(id:string): Observable<User>
  {
   return this.http.get<User>(`${this.api}/${id}`)
}


}