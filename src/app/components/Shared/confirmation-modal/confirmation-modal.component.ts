import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="onCancel()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="icon-container">
            <i [class]="icon" [style.color]="iconColor"></i>
          </div>
          <div class="message-container" [innerHTML]="sanitizedMessage"></div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn btn-confirm" (click)="onConfirm()" [class]="confirmButtonClass">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e5e5;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: #f5f5f5;
    }

    .modal-body {
      padding: 20px;
      text-align: center;
    }

    .icon-container {
      margin-bottom: 16px;
    }

    .icon-container i {
      font-size: 48px;
    }

    .message-container {
      font-size: 16px;
      line-height: 1.5;
      color: #555;
    }

    .message-container p {
      margin: 0;
    }

    .message-container strong {
      font-weight: 600;
      color: #333;
    }

    .message-container em {
      font-style: italic;
    }

    .message-container u {
      text-decoration: underline;
    }

    .message-container .highlight {
      background-color: #fffacd;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 20px;
      border-top: 1px solid #e5e5e5;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      min-width: 80px;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #333;
    }

    .btn-cancel:hover {
      background: #e5e5e5;
    }

    .btn-confirm {
      background: #dc3545;
      color: white;
    }

    .btn-confirm:hover {
      background: #c82333;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #138496;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .modal-content {
        background: #2d3748;
        color: #e2e8f0;
      }

      .modal-header {
        border-bottom-color: #4a5568;
      }

      .modal-header h3 {
        color: #e2e8f0;
      }

      .close-btn {
        color: #a0aec0;
      }

      .close-btn:hover {
        background: #4a5568;
      }

      .message-container {
        color: #cbd5e0;
      }

      .message-container strong {
        color: #e2e8f0;
      }

      .modal-footer {
        border-top-color: #4a5568;
      }

      .btn-cancel {
        background: #4a5568;
        color: #e2e8f0;
      }

      .btn-cancel:hover {
        background: #5a6578;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirmation Required';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() icon: string = 'fas fa-question-circle';
  @Input() iconColor: string = '#ffc107';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() confirmButtonClass: string = 'btn-confirm';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Method to safely render HTML
  get sanitizedMessage(): string {
    // You can use a proper sanitizer here if needed
    // For basic HTML tags, this is safe enough
    return this.message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;(strong|b|em|i|u|span|div|p|br|small|mark)&gt;/gi, '<$1>')
      .replace(/&lt;\/(strong|b|em|i|u|span|div|p|br|small|mark)&gt;/gi, '</$1>')
      .replace(/&lt;(strong|b|em|i|u|span|div|p|br|small|mark)\s+([^&]*)&gt;/gi, '<$1 $2>');
  }

  onConfirm(): void {
    this.confirm.emit();
    this.isVisible = false;
  }

  onCancel(): void {
    this.cancel.emit();
    this.isVisible = false;
  }

  onOverlayClick(event: Event): void {
    this.onCancel();
  }
}