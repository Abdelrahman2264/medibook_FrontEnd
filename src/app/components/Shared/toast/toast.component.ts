import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast, ToastType } from '../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts.length > 0">
      <div 
        *ngFor="let toast of toasts" 
        class="toast toast-{{ toast.type }}"
        [@slideInOut]
      >
        <div class="toast-icon">
          <i [class]="getIcon(toast.type)"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      background: var(--surface-01);
      border-left: 4px solid;
      pointer-events: auto;
      animation: slideInRight 0.3s ease-out;
      min-width: 300px;
      max-width: 400px;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: var(--success-500);
      background: var(--success-50);
      color: var(--success-700);
    }

    .toast-error {
      border-left-color: var(--error-500);
      background: var(--error-50);
      color: var(--error-700);
    }

    .toast-warning {
      border-left-color: var(--warning-500);
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .toast-info {
      border-left-color: var(--info-500);
      background: var(--info-50);
      color: var(--info-700);
    }

    .toast-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .toast-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  }
}

