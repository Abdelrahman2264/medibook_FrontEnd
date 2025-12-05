import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-modal.component.html',
  styleUrls: ['./verification-modal.component.css'],
  encapsulation: ViewEncapsulation.None // Disable view encapsulation to ensure styles apply
})
export class VerificationModalComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() isVisible: boolean = false;
  @Input() email: string = '';
  @Input() isVerifying: boolean = false;
  @Input() verificationError: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() verify = new EventEmitter<string>();
  @Output() resend = new EventEmitter<void>();
  
  verificationCode: string = '';

  ngOnInit() {
    console.log('🔵 VerificationModalComponent - ngOnInit, isVisible:', this.isVisible);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      console.log('🔵 VerificationModalComponent - isVisible changed:', changes['isVisible'].currentValue);
    }
  }

  ngAfterViewInit() {
    console.log('🔵 VerificationModalComponent - ngAfterViewInit, isVisible:', this.isVisible);
    setTimeout(() => {
      const overlay = document.querySelector('.verification-modal-overlay');
      console.log('🔵 VerificationModalComponent - Overlay in DOM:', overlay);
      if (overlay) {
        console.log('🔵 VerificationModalComponent - Overlay styles:', window.getComputedStyle(overlay));
      }
    }, 100);
  }

  onClose() {
    this.verificationCode = '';
    this.close.emit();
  }

  onVerify() {
    if (this.verificationCode && this.verificationCode.trim().length >= 4) {
      this.verify.emit(this.verificationCode.trim());
    }
  }

  onResend() {
    this.verificationCode = '';
    this.resend.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Close modal when clicking on overlay (but not on modal content)
    if ((event.target as HTMLElement).classList.contains('verification-modal-overlay')) {
      this.onClose();
    }
  }
}

