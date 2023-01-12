import { User } from './../../models/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment} from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  api = `${environment.apiUrl}users/register`

  constructor(private http: HttpClient) {


   }


   register(form: User):Observable<User>
   {
    return this.http.post<User>(`${this.api}`,form )
  }
}
