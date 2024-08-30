import { Routes } from '@angular/router';
import { loggedGuard } from './guards/logged.guard';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [loggedGuard],
        component: LoginComponent
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        component: DashboardComponent
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: '404',
        component: NotFoundComponent
      },
      {
        path: '**',
        redirectTo: '404',
        pathMatch: 'full'
      }
];