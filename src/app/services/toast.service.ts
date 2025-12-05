import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  private defaultDuration = 5000; // 5 seconds

  /**
   * Show a success toast
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 7000); // Errors stay longer
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show a toast
   */
  private show(message: string, type: ToastType, duration?: number): void {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      duration: duration || this.defaultDuration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  /**
   * Remove a toast by ID
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


