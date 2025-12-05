import { Component, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-forget-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forget-password-modal.component.html',
  styleUrls: ['./forget-password-modal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ForgetPasswordModalComponent {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  // Step 1: Email
  email: string = '';
  emailError: string = '';
  isCheckingEmail: boolean = false;
  emailSent: boolean = false;
  userId: number = 0;

  // Step 2: Verification Code
  verificationCode: string = '';
  codeError: string = '';
  isVerifyingCode: boolean = false;
  codeVerified: boolean = false;

  // Step 3: New Password
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  isResetting: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  currentStep: number = 1;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private toastService: ToastService
  ) {}

  onClose() {
    this.reset();
    this.close.emit();
  }

  reset() {
    this.currentStep = 1;
    this.email = '';
    this.emailError = '';
    this.emailSent = false;
    this.userId = 0;
    this.verificationCode = '';
    this.codeError = '';
    this.codeVerified = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('forget-password-modal-overlay')) {
      this.onClose();
    }
  }

  // Step 1: Check Email
  onCheckEmail() {
    this.emailError = '';
    
    if (!this.email || !this.email.trim()) {
      this.emailError = 'Please enter your email address';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.isCheckingEmail = true;

    this.authService.checkEmailForForgetPassword(this.email.trim()).subscribe({
      next: (response: any) => {
        // If we reach here, HTTP status is 200 (success)
        // Automatically advance to step 2
        console.log('HTTP 200 - Email check successful. Response:', response);
        
        // Run in Angular zone to ensure change detection
        this.ngZone.run(() => {
          this.isCheckingEmail = false;
          
          // If response body explicitly indicates failure, show error
          if (response && response.success === false) {
            this.emailError = response.message || 'Email not found. Please check and try again.';
            this.cdr.detectChanges();
            return;
          }
          
          // HTTP 200 received - automatically advance to step 2
          console.log('HTTP 200 received - Automatically advancing to step 2');
          
          this.emailSent = true;
          this.userId = response?.userId || response?.data?.userId || response?.user?.id || 0;
          this.emailError = '';
          
          // CRITICAL: Update step to 2 automatically
          this.currentStep = 2;
          
          console.log('Step automatically changed to:', this.currentStep);
          
          // Force change detection to update UI immediately
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          
          // Additional change detection after a microtask to ensure UI updates
          Promise.resolve().then(() => {
            this.ngZone.run(() => {
              if (this.currentStep !== 2) {
                this.currentStep = 2;
              }
              this.cdr.detectChanges();
            });
          });
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isCheckingEmail = false;
          if (error.status === 404) {
            this.emailError = 'Email not found. Please check and try again.';
          } else if (error.status === 0) {
            this.emailError = 'Unable to connect to server. Please check your connection.';
          } else {
            this.emailError = error.error?.message || 'An error occurred. Please try again.';
          }
          console.error('Check email error:', error);
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Auto-verify when 6 digits are entered
  onCodeInput() {
    // Only auto-verify if we have exactly 6 digits and not already verifying
    if (this.verificationCode && this.verificationCode.trim().length === 6 && !this.isVerifyingCode) {
      // Small delay to ensure the input is complete
      setTimeout(() => {
        if (this.verificationCode && this.verificationCode.trim().length === 6) {
          this.onVerifyCode();
        }
      }, 300);
    }
  }

  // Step 2: Verify Code
  onVerifyCode() {
    this.codeError = '';
    
    if (!this.verificationCode || this.verificationCode.trim().length < 4) {
      this.codeError = 'Please enter the verification code';
      return;
    }

    this.isVerifyingCode = true;

    this.authService.verifyForgetPasswordCode(this.email.trim(), this.verificationCode.trim()).subscribe({
      next: (response: any) => {
        // If we reach here, HTTP status is 200 (success)
        // Automatically advance to step 3
        console.log('HTTP 200 - Code verification successful. Response:', response);
        
        // Run in Angular zone to ensure change detection
        this.ngZone.run(() => {
          this.isVerifyingCode = false;
          
          // If response body explicitly indicates failure, show error
          if (response && response.success === false) {
            this.codeError = response.message || 'Invalid verification code. Please try again.';
            this.cdr.detectChanges();
            return;
          }
          
          // HTTP 200 received - automatically advance to step 3
          console.log('HTTP 200 received - Automatically advancing to step 3');
          
          this.codeVerified = true;
          this.codeError = '';
          
          // CRITICAL: Update step to 3 automatically
          this.currentStep = 3;
          
          console.log('Step automatically changed to:', this.currentStep);
          
          // Force change detection to update UI immediately
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          
          // Additional change detection after a microtask to ensure UI updates
          Promise.resolve().then(() => {
            this.ngZone.run(() => {
              if (this.currentStep !== 3) {
                this.currentStep = 3;
              }
              this.cdr.detectChanges();
            });
          });
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.isVerifyingCode = false;
          if (error.status === 400) {
            this.codeError = error.error?.message || 'Invalid or expired verification code.';
          } else if (error.status === 0) {
            this.codeError = 'Unable to connect to server. Please check your connection.';
          } else {
            this.codeError = error.error?.message || 'An error occurred. Please try again.';
          }
          console.error('Verify code error:', error);
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Step 3: Reset Password
  onResetPassword() {
    this.passwordError = '';
    
    if (!this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this.isResetting = true;

    this.authService.resetPassword(this.email.trim(), this.newPassword, this.confirmPassword).subscribe({
      next: (response: any) => {
        this.isResetting = false;
        this.success.emit();
        this.onClose();
        // Show success message (you can add a toast notification here)
        this.toastService.success('Password reset successfully! You can now login with your new password.');
      },
      error: (error) => {
        this.isResetting = false;
        if (error.status === 400) {
          this.passwordError = error.error?.message || 'Failed to reset password. Please try again.';
        } else if (error.status === 0) {
          this.passwordError = 'Unable to connect to server. Please check your connection.';
        } else {
          this.passwordError = error.error?.message || 'An error occurred. Please try again.';
        }
        console.error('Reset password error:', error);
      }
    });
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Reset errors when going back
      if (this.currentStep === 1) {
        this.codeError = '';
        this.verificationCode = '';
      } else if (this.currentStep === 2) {
        this.passwordError = '';
        this.newPassword = '';
        this.confirmPassword = '';
      }
      this.cdr.detectChanges();
    }
  }

  goToStep(step: number) {
    // Validate step transitions
    if (step === 2 && !this.emailSent) {
      console.warn('Cannot go to step 2: Email not sent yet');
      return;
    }
    if (step === 3 && !this.codeVerified) {
      console.warn('Cannot go to step 3: Code not verified yet');
      return;
    }
    
    // Update step
    this.currentStep = step;
    this.cdr.detectChanges();
    console.log('Manually moved to step:', step);
  }
}

