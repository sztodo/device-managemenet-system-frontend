import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DeviceService } from '../../core/services/device.service';
import { UserService } from '../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { DeviceTypeLabel } from '../../core/models/device.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-device-detail.component',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, MatIconModule],
  templateUrl: './device-detail.component.html',
  styleUrl: './device-detail.component.scss',
})
export class DeviceDetailComponent implements OnInit {
  protected readonly deviceService = inject(DeviceService);
  protected readonly userService = inject(UserService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly DeviceTypeLabel = DeviceTypeLabel;
  protected readonly showDeleteDialog = signal(false);
  private readonly currentUserId = computed(() => this.authService.linkedUserId());

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.deviceService.getById(id).subscribe();
    this.userService.loadAll().subscribe();
  }

  isAssignedToMe(assignedUserId?: number | null): boolean {
    return (
      assignedUserId !== null &&
      assignedUserId !== undefined &&
      assignedUserId === this.currentUserId()
    );
  }

  selfAssign(deviceId: number): void {
    this.deviceService.selfAssign(deviceId).subscribe({
      next: () => this.toast.success('Device assigned to you.'),
    });
  }

  selfUnassign(deviceId: number): void {
    this.deviceService.selfUnassign(deviceId).subscribe({
      next: () => this.toast.success('Device returned successfully.'),
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
