import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../core/services/device.service';
import { ToastService } from '../../shared/services/toast.service';
import { Device, DeviceType } from '../../core/models/device.model';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component/confirm-dialog.component';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-device-list.component',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, MatIconModule],
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.scss',
})
export class DeviceListComponent implements OnInit {
  protected readonly deviceService = inject(DeviceService);
  protected readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly DeviceType = DeviceType;
  protected searchTerm = '';
  protected readonly activeFilter = signal<'all' | 'phone' | 'tablet' | 'unassigned'>('all');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deviceToDelete = signal<Device | null>(null);

  protected readonly filteredDevices = computed(() => {
    let list = this.deviceService.devices();
    const term = this.searchTerm.toLowerCase();
    const filter = this.activeFilter();

    if (term) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.manufacturer.toLowerCase().includes(term) ||
        d.operatingSystem.toLowerCase().includes(term) ||
        d.assignedUserName?.toLowerCase().includes(term)
      );
    }

    if (filter === 'phone')      list = list.filter(d => d.type === DeviceType.Phone);
    if (filter === 'tablet')     list = list.filter(d => d.type === DeviceType.Tablet);
    if (filter === 'unassigned') list = list.filter(d => !d.assignedUserId);

    return list;
  });

  ngOnInit(): void {
    this.deviceService.loadAll().subscribe();
  }

  confirmDelete(device: Device): void {
    this.deviceToDelete.set(device);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const device = this.deviceToDelete();
    if (!device) return;
    this.deviceService.delete(device.id).subscribe({
      next: () => {
        this.toast.success(`"${device.name}" deleted successfully.`);
        this.showDeleteDialog.set(false);
      }
    });
  }
}
