import { User } from './../../models/user';
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

  getUsers() : Observable<User[]>{
    return this.http.get<User[]>(`${this.api}`);
  }

  getUserById(id: string) : Observable<User>
  {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  postUser(user : User) : Observable<User>
  {
    return this.http.post<User>(`${this.api}`, user);
  }

  deleteUser(id: string): Observable<User>
  {
    return this.http.delete<User>(`${this.api}/${id}`);
  }

  editUser( id : string , user: User ) : Observable<User>
  {
    return this.http.put<User>(`${this.api}/${id}`, user);
  }

}
