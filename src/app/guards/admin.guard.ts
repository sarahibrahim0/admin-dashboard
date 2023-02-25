import { LoginService } from './../services/login/login.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanActivate {

  constructor(private LoginService: LoginService,
    private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | UrlTree | Promise<boolean> | UrlTree | boolean | UrlTree {

      const token = this.LoginService.getToken();

      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token)


    if (decodedToken && decodedToken.isAdmin && this.getExpDate(decodedToken.exp) )
     {
      return true;
     }

    else {
      this.router.navigateByUrl('/login')
      return false;
    }


  }



  private getExpDate(expirationDate): Boolean
  {
    return Math.floor( new Date().getTime()/1000) <= expirationDate;

  }

}
