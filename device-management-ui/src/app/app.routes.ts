import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'devices',

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
