import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      role: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
    },
    { validators: passwordMatchValidator },
  );

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  strengthClass(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
    if (pw.length >= 8) return 'medium';
    return 'weak';
  }

  strengthWidth(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return '100%';
    if (pw.length >= 8) return '60%';
    return '30%';
  }

  strengthLabel(pw: string): string {
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'Strong';
    if (pw.length >= 8) return 'Medium';
    return 'Weak';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const v = this.form.getRawValue();

    this.authService
      .register({
        email: v.email!,
        password: v.password!,
        name: v.name!,
        role: v.role!,
        location: v.location!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Account created! Welcome to DevTrack.');
          this.router.navigate(['/devices']);
        },
        error: () => this.loading.set(false),
      });
  }
}
