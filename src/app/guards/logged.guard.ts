import { CanActivateFn, Router } from '@angular/router';
import { inject } from "@angular/core";
import { AuthService } from '../services/auth.service';

export const loggedGuard: CanActivateFn = (route, state) => {

  const router = inject(Router) 
  const authSrv = inject(AuthService);

  if (authSrv.isLoggedIn()) {
    router.navigate(['/dashboard']); // Reindirizza l'utente se è già autenticato
    return false; // Blocca l'accesso alla pagina di login
  } else {
    return true; // Consenti l'accesso alla pagina di login
  }
};