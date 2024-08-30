import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authSrv = inject(AuthService);
    const router = inject(Router);

  const isLoggedIn = authSrv.isLoggedIn();

  if(isLoggedIn){
    return true;
  }else{
    router.navigate(['/login']);
    return false;
  }
}