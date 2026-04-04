import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard-guard';
import { authGuard } from './core/guards/auth.guard-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'devices',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./devices/device-list.component/device-list.component').then(
            (m) => m.DeviceListComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./devices/device-form.component/device-form.component').then(
            (m) => m.DeviceFormComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./devices/device-detail.component/device-detail.component').then(
            (m) => m.DeviceDetailComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./devices/device-form.component/device-form.component').then(
            (m) => m.DeviceFormComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'devices' },
];
