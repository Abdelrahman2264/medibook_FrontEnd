import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { VerificationModalComponent } from './verification-modal.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, VerificationModalComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  // Step tracking
  currentStep: number = 1;
  totalSteps: number = 2;

  // User data matching API model
  userData = {
    firstName: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    mitrialStatus: '',
    profileImage: '',
    dateOfBirth: ''
  };
  
  
  // Verification
  verificationCode: string = '';
  generatedCode: string = ''; // Code generated on frontend
  showVerificationModal: boolean = false;
  isVerifying: boolean = false;
  verificationError: string = '';
  
  // UI states
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  isLoading = false;
  errorMessage: string = '';
  profileImagePreview: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.userData.password === this.userData.confirmPassword;
  }

  getPasswordStrength(): string {
    const password = this.userData.password;
    if (!password) return '';
    
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.userData.profileImage = e.target.result; // Base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  validateStep1(): boolean {
    if (!this.userData.firstName || !this.userData.lastName || 
        !this.userData.email || !this.userData.mobilePhone ||
        !this.userData.password || !this.userData.dateOfBirth ||
        !this.userData.gender || !this.userData.mitrialStatus) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    if (!this.passwordsMatch()) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Please accept the terms and conditions';
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  onStep1Submit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    this.errorMessage = '';
    
    if (!this.validateStep1()) {
      return;
    }

    this.isLoading = true;
    
    // Generate verification code on frontend
    this.generatedCode = this.generateVerificationCode();
    console.log('Generated verification code:', this.generatedCode);
    
    // Step 1: Send verification request WITH generated code
    // Ensure all fields are trimmed and not empty
    const verificationData = {
      email: this.userData.email.trim(),
      firstname: this.userData.firstName.trim(),
      lastname: this.userData.lastName.trim(),
      gender: this.userData.gender.trim(),
      code: this.generatedCode // Include the generated code
    };

    // Validate data before sending
    if (!verificationData.email || !verificationData.firstname || 
        !verificationData.lastname || !verificationData.gender) {
      this.errorMessage = 'Please fill in all required fields';
      this.isLoading = false;
      return;
    }

    console.log('Sending verification request with code:', JSON.stringify(verificationData, null, 2));
    
    this.authService.sendVerification(verificationData).subscribe({
      next: (response) => {
        console.log('✅ Verification request successful (status 200):', response);
        this.isLoading = false;
        
        // Show verification modal after successful response (status 200)
        this.currentStep = 2;
        this.verificationCode = '';
        this.verificationError = '';
        
        // Show verification modal immediately
        this.showVerificationModal = true;
        this.cdr.detectChanges();
        
        console.log('✅ Modal opened. showVerificationModal:', this.showVerificationModal);
        console.log('✅ Current step:', this.currentStep);
        
        // Debug: Check if modal component and element exists in DOM
        setTimeout(() => {
          // Check for the component element
          const componentElement = document.querySelector('app-verification-modal');
          console.log('🔍 Component element (app-verification-modal) in DOM:', componentElement);
          
          // Check for the overlay
          const modalElement = document.querySelector('.verification-modal-overlay');
          console.log('🔍 Modal overlay element in DOM:', modalElement);
          
          if (componentElement) {
            console.log('✅ Component element found!');
            console.log('🔍 Component element styles:', window.getComputedStyle(componentElement));
            console.log('🔍 Component element innerHTML length:', componentElement.innerHTML.length);
          } else {
            console.error('❌ Component element (app-verification-modal) not found in DOM!');
          }
          
          if (modalElement) {
            console.log('✅ Modal overlay found!');
            console.log('🔍 Modal computed styles:', window.getComputedStyle(modalElement));
            console.log('🔍 Modal display:', window.getComputedStyle(modalElement).display);
            console.log('🔍 Modal visibility:', window.getComputedStyle(modalElement).visibility);
            console.log('🔍 Modal opacity:', window.getComputedStyle(modalElement).opacity);
            console.log('🔍 Modal z-index:', window.getComputedStyle(modalElement).zIndex);
          } else {
            console.error('❌ Modal overlay element not found in DOM!');
            console.error('   This means the component is not rendering the template.');
            console.error('   Check if isVisible is true in the component.');
          }
        }, 200);
      },
      error: (error) => {
        console.error('❌ Send verification error:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        console.error('Error message:', error.message);
        this.isLoading = false;
        
        // Show detailed error message from backend
        if (error.status === 400) {
          const backendMessage = error.error?.message || error.error?.title || JSON.stringify(error.error);
          this.errorMessage = `Validation error: ${backendMessage}`;
        } else if (error.status === 409) {
          this.errorMessage = error.error?.message || 'This email is already registered';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = error.error?.message || `Failed to send verification code. Status: ${error.status}`;
        }
      }
    });
  }

  verifyCode(code?: string) {
    const codeToVerify = code || this.verificationCode;
    
    if (!codeToVerify || codeToVerify.trim().length < 4) {
      this.verificationError = 'Please enter the verification code';
      return;
    }

    this.isVerifying = true;
    this.verificationError = '';

    // Compare entered code with generated code (frontend verification)
    const enteredCode = codeToVerify.trim();
    
    console.log('Comparing codes - Entered:', enteredCode, 'Generated:', this.generatedCode);

    if (enteredCode !== this.generatedCode) {
      this.isVerifying = false;
      this.verificationError = 'Invalid verification code. Please try again.';
      return;
    }

    // Code is correct, create the user
    console.log('✅ Code verified successfully, creating user...');
    this.createUser();
  }

  createUser() {
    // Prepare user data for API - ensure all fields are properly formatted
    let dateOfBirthISO = '';
    if (this.userData.dateOfBirth) {
      const date = new Date(this.userData.dateOfBirth);
      if (!isNaN(date.getTime())) {
        dateOfBirthISO = date.toISOString();
      } else {
        console.error('Invalid date of birth:', this.userData.dateOfBirth);
        this.verificationError = 'Invalid date of birth. Please try again.';
        this.isVerifying = false;
        return;
      }
    }

    const userPayload = {
      firstName: (this.userData.firstName || '').trim(),
      lastName: (this.userData.lastName || '').trim(),
      email: (this.userData.email || '').trim(),
      mobilePhone: (this.userData.mobilePhone || '').trim(),
      password: this.userData.password || '',
      gender: (this.userData.gender || '').trim(),
      mitrialStatus: (this.userData.mitrialStatus || '').trim(),
      profileImage: this.userData.profileImage || '',
      dateOfBirth: dateOfBirthISO
    };

    console.log('🚀 SignupComponent - Creating user with payload:', userPayload);

    this.userService.createUser(userPayload).subscribe({
      next: (response) => {
        console.log('✅ SignupComponent - User created successfully:', response);
        this.isVerifying = false;
        this.showVerificationModal = false;
        // Navigate to login page
        this.router.navigate(['/signin'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: (error) => {
        this.isVerifying = false;
        
        // Detailed error logging
        console.error('❌ SignupComponent - Create user error:');
        console.error('   Status:', error.status);
        console.error('   Status Text:', error.statusText);
        console.error('   Error Message:', error.message);
        console.error('   Error URL:', error.url);
        console.error('   Full Error Object:', error);
        console.error('   Error Body:', error.error);
        
        // Extract readable error message
        let errorMessage = 'Failed to create account. ';
        
        if (error.status === 0) {
          errorMessage += 'Unable to connect to server. ';
          errorMessage += 'Please check:\n';
          errorMessage += '1. Is the backend server running?\n';
          errorMessage += `2. Is it accessible at http://localhost:5262?\n`;
          errorMessage += '3. Check CORS settings on the backend';
        } else if (error.status === 400) {
          // Bad Request - validation errors
          const backendError = error.error;
          console.error('   Backend Error Object:', JSON.stringify(backendError, null, 2));
          
          if (backendError?.errors) {
            // ModelState errors from .NET
            const validationErrors: string[] = [];
            Object.keys(backendError.errors).forEach(key => {
              const messages = backendError.errors[key];
              console.error(`   Validation error for "${key}":`, messages);
              if (Array.isArray(messages)) {
                validationErrors.push(`${key}: ${messages.join(', ')}`);
              } else {
                validationErrors.push(`${key}: ${messages}`);
              }
            });
            errorMessage += 'Validation errors:\n' + validationErrors.join('\n');
          } else if (backendError?.title) {
            errorMessage += backendError.title;
            if (backendError.detail) {
              errorMessage += ': ' + backendError.detail;
            }
          } else if (backendError?.message) {
            errorMessage += backendError.message;
          } else {
            errorMessage += JSON.stringify(backendError);
          }
        } else if (error.status === 409) {
          errorMessage += 'This email is already registered.';
        } else if (error.status === 500) {
          errorMessage += 'Server error. Please try again later.';
          if (error.error?.message) {
            errorMessage += '\n' + error.error.message;
          }
        } else if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
        }
        
        this.verificationError = errorMessage;
        
        // Also show in main error message area
        this.errorMessage = errorMessage;
      }
    });
  }

  resendCode() {
    this.verificationError = '';
    this.verificationCode = '';
    this.isLoading = true;
    
    // Generate new code
    this.generatedCode = this.generateVerificationCode();
    console.log('Resending with new generated code:', this.generatedCode);
    
    // Resend verification request with new generated code
    const verificationData = {
      email: this.userData.email.trim(),
      firstname: this.userData.firstName.trim(),
      lastname: this.userData.lastName.trim(),
      gender: this.userData.gender.trim(),
      code: this.generatedCode // New generated code
    };

    console.log('Resending verification request:', verificationData);

    this.authService.sendVerification(verificationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Code resent successfully');
      },
      error: (error) => {
        this.isLoading = false;
        this.verificationError = 'Failed to resend code. Please try again.';
        console.error('❌ Resend code error:', error);
      }
    });
  }

  closeVerificationModal() {
    this.showVerificationModal = false;
    this.currentStep = 1;
    this.verificationCode = '';
    this.verificationError = '';
    this.generatedCode = ''; // Clear generated code
  }
}
