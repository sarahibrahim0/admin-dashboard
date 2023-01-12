import { LoginService } from './../services/login/login.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AdminInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService) {}


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const token = this.loginService.getToken();
    const apiUrl = request.url.startsWith(environment.apiUrl);

     if(apiUrl && token){

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

     }

     return next.handle(request);


  }
}
