import { Routes } from '@angular/router';
import { loggedGuard } from './guards/logged.guard';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FilesResolver } from './components/dashboard/resolvers/files.resolver';
import { FiltersResolver } from './components/dashboard/resolvers/filters.resolver';
import { AccountDetailsComponent } from './components/account-details/account-details.component';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [loggedGuard],
        component: LoginComponent
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        component: DashboardComponent,
        resolve: {
          filters: FiltersResolver,
          files: FilesResolver
        },
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
      },
      {
        path: '404',
        component: NotFoundComponent
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
];