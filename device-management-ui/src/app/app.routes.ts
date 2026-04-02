import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'devices',
    loadComponent: () =>
      import('./devices/device-list.component/device-list.component').then(
        (m) => m.DeviceListComponent,
      ),
  },
];
