import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AssignDeviceRequest,
  CreateDeviceRequest,
  Device,
  UpdateDeviceRequest,
} from '../models/device.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/Device';

  private readonly _devices = signal<Device[]>([]);
  private readonly _selectedDevice = signal<Device | null>(null);
  private readonly _loading = signal(false);

  readonly devices = this._devices.asReadonly();
  readonly selectedDevice = this._selectedDevice.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalDevices = computed(() => this._devices().length);
  readonly assignedDevices = computed(() => this._devices().filter((d) => d.assignedUserId));
  readonly unassignedDevices = computed(() => this._devices().filter((d) => !d.assignedUserId));

  constructor() {}

  loadAll(): Observable<Device[]> {
    this._loading.set(true);
    return this.http.get<Device[]>(this.BASE).pipe(
      tap({
        next: (devices) => {
          this._devices.set(devices);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getById(id: number): Observable<Device> {
    this._loading.set(true);
    return this.http.get<Device>(`${this.BASE}/${id}`).pipe(
      tap({
        next: (device) => {
          this._selectedDevice.set(device);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  create(request: CreateDeviceRequest): Observable<Device> {
    this._loading.set(true);
    return this.http.post<Device>(this.BASE, request).pipe(
      tap({
        next: (device) => {
          this._devices.update((list) => [...list, device]);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  update(id: number, request: UpdateDeviceRequest): Observable<Device> {
    this._loading.set(true);
    return this.http.put<Device>(`${this.BASE}/${id}`, request).pipe(
      tap({
        next: (updated) => {
          this._devices.update((list) => list.map((d) => (d.id === id ? updated : d)));
          this._selectedDevice.set(updated);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  delete(id: number): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap({
        next: () => {
          this._devices.update((list) => list.filter((d) => d.id !== id));
          if (this._selectedDevice()?.id === id) this._selectedDevice.set(null);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  assignUser(deviceId: number, request: AssignDeviceRequest): Observable<Device> {
    return this.http.patch<Device>(`${this.BASE}/${deviceId}/assign`, request).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }
  selfAssign(deviceId: number): Observable<Device> {
    return this.http.post<Device>(`${this.BASE}/${deviceId}/self-assign`, {}).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }

  selfUnassign(deviceId: number): Observable<Device> {
    return this.http.delete<Device>(`${this.BASE}/${deviceId}/self-unassign`).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }

  selectDevice(device: Device | null): void {
    this._selectedDevice.set(device);
  }

  existsByName(name: string, excludeId?: number): boolean {
    return this._devices().some(
      (d) => d.name.toLowerCase() === name.toLowerCase() && d.id !== excludeId,
    );
  }
}
