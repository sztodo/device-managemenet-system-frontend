import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../core/services/device.service';
import { ToastService } from '../../shared/services/toast.service';
import { Device, DeviceTypeLabel } from '../../core/models/device.model';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-device-list.component',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, MatIconModule],
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.scss',
})
export class DeviceListComponent implements OnInit {
  protected readonly deviceService = inject(DeviceService);
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly DeviceTypeLabel = DeviceTypeLabel;
  protected searchTerm = '';
  protected readonly activeFilter = signal<'all' | 'phone' | 'tablet' | 'unassigned'>('all');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deviceToDelete = signal<Device | null>(null);

  protected readonly message = this.authService.isAdmin()
    ? 'This device will be permanently removed from the system.'
    : 'This device will be unassigned from you.';

  protected readonly filteredDevices = computed(() => {
    let list = this.deviceService.devices();
    const term = this.searchTerm.toLowerCase();
    const filter = this.activeFilter();

    if (term) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.manufacturer.toLowerCase().includes(term) ||
          d.operatingSystem.toLowerCase().includes(term) ||
          d.assignedUserName?.toLowerCase().includes(term),
      );
    }

    if (filter === 'phone') list = list.filter((d) => d.typeLabel === DeviceTypeLabel.Phone);
    if (filter === 'tablet') list = list.filter((d) => d.typeLabel === DeviceTypeLabel.Tablet);
    if (filter === 'unassigned') list = list.filter((d) => !d.assignedUserId);
    return list;
  });

  readonly currentUserId = computed(() => this.authService.linkedUserId());

  ngOnInit(): void {
    this.deviceService.loadAll().subscribe();
  }

  isAssignedToMe(assignedUserId?: number | null): boolean {
    var isAssignedToMe =
      assignedUserId !== null &&
      assignedUserId !== undefined &&
      assignedUserId === this.currentUserId();
    return isAssignedToMe;
  }

  confirmDelete(device: Device): void {
    this.deviceToDelete.set(device);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const device = this.deviceToDelete();
    if (!device) return;
    if (this.authService.isAdmin()) {
      this.deviceService.delete(device.id).subscribe({
        next: () => {
          this.toast.success(`"${device.name}" deleted successfully.`);
          this.showDeleteDialog.set(false);
        },
      });
    } else {
      this.deviceService.selfUnassign(device.id).subscribe({
        next: () => {
          this.toast.success(`"${device.name}" returned successfully.`);
          this.showDeleteDialog.set(false);
        },
      });
    }
  }
}
