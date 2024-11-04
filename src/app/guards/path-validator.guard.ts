// path-validator.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class PathValidatorGuard implements CanActivate {

    constructor(
        private router: Router,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const app = route.paramMap.get('app');
        const currentUrl = state.url;
        
        // Se il path inizia con /finrisk o contiene la parola finrisk
        if (currentUrl.toLowerCase().includes('finrisk')) {
            if (app !== 'finrisk') {
                const newPath = currentUrl.replace(app!, 'finrisk');
                this.router.navigate([newPath]);
                return false;
            }
            localStorage.setItem('lastPath', 'finrisk')
            return true;
        }
        
        // Se il path inizia con /finbil o contiene la parola finbil
        if (currentUrl.toLowerCase().includes('finbil')) {
            if (app !== 'finbil') {
                const newPath = currentUrl.replace(app!, 'finbil');
                this.router.navigate([newPath]);
                return false;
            }
            localStorage.setItem('lastPath', 'finbil');
            return true;
        }

        const lastPath = localStorage.getItem('lastPath') as string;
        const newPath = currentUrl.replace(app!, lastPath);
        this.router.navigate([newPath]);
        return false;
    }
}