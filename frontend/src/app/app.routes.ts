import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shell/shell.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];
