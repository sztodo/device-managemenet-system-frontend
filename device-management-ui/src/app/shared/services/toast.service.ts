import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.models';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private counter = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void { this.add(message, 'success'); }
  error(message: string): void   { this.add(message, 'error'); }
  info(message: string): void    { this.add(message, 'info'); }
  warning(message: string): void { this.add(message, 'warning'); }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, type: ToastType): void {
    const id = ++this.counter;
    this._toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
