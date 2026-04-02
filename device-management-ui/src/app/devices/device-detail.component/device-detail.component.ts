import { Component, inject, OnInit, signal } from '@angular/core';
import { DeviceService } from '../../core/services/device.service';
import { UserService } from '../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { DeviceTypeLabel } from '../../core/models/device.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-device-detail.component',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, MatIconModule],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss',
})
export class DeviceDetailComponent implements OnInit {
  protected readonly deviceService = inject(DeviceService);
  protected readonly userService = inject(UserService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly DeviceTypeLabel = DeviceTypeLabel;
  protected readonly showDeleteDialog = signal(false);
  protected selectedUserId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deviceService.getById(id).subscribe();
    this.userService.loadAll().subscribe();
  }

  assign(deviceId: number): void {
    if (!this.selectedUserId) return;
    this.deviceService.assignUser(deviceId, { userId: this.selectedUserId }).subscribe({
      next: () => this.toast.success('Device assigned successfully.'),
    });
  }

  unassign(deviceId: number): void {
    this.deviceService.assignUser(deviceId, { userId: null }).subscribe({
      next: () => this.toast.success('Device unassigned.'),
    });
  }

  onDeleteConfirmed(): void {
    const device = this.deviceService.selectedDevice();
    if (!device) return;
    this.deviceService.delete(device.id).subscribe({
      next: () => {
        this.toast.success(`"${device.name}" deleted.`);
        this.router.navigate(['/devices']);
      },
    });
  }
}
