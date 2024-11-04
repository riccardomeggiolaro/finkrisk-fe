// 2. app.routes.ts
import { Routes } from '@angular/router';
import { PathValidatorGuard } from './guards/path-validator.guard';
import { loggedGuard } from './guards/logged.guard';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';

export const routes: Routes = [
    {
        path: ':app',
        canActivate: [PathValidatorGuard],  // Aggiungi la guardia qui
        children: [
            {
                path: 'login',
                canActivate: [loggedGuard],
                component: LoginComponent
            },
            {
                path: 'dashboard',
                canActivate: [authGuard],
                component: DashboardComponent,
                runGuardsAndResolvers: 'paramsOrQueryParamsChange'
            },
            {
                path: 'account-details',
                canActivate: [authGuard],
                component: AccountDetailsComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];