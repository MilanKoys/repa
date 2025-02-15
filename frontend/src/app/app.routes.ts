import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { AuthGuard } from './guards';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./views/shell/shell.routes').then((m) => m.routes),
    canMatch: [AuthGuard],
  },
];
