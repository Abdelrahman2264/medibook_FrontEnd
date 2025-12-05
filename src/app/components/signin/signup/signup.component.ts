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
  
  // Validation states
  submitted = false;
  emailChecking = false;
  emailExists = false;
  emailError: string = '';
  phoneChecking = false;
  phoneExists = false;
  phoneError: string = '';
  passwordError: string = '';
  dateError: string = '';
  
  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

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
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    
    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, hasMinLength].filter(Boolean).length;
    
    if (criteriaCount < 3) return 'weak';
    if (criteriaCount < 5) return 'medium';
    return 'strong';
  }
  
  validatePasswordComplexity(): boolean {
    const password = this.userData.password;
    if (!password) {
      this.passwordError = 'Password is required';
      return false;
    }
    
    if (password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      this.passwordError = 'Password must contain at least one uppercase letter';
      return false;
    }
    
    if (!/[a-z]/.test(password)) {
      this.passwordError = 'Password must contain at least one lowercase letter';
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      this.passwordError = 'Password must contain at least one number';
      return false;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.passwordError = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
      return false;
    }
    
    this.passwordError = '';
    return true;
  }
  
  validateDateOfBirth(): boolean {
    if (!this.userData.dateOfBirth) {
      this.dateError = 'Date of birth is required';
      return false;
    }
    
    const selectedDate = new Date(this.userData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      this.dateError = 'Date of birth cannot be in the future';
      return false;
    }
    
    // Check if age is reasonable (at least 1 year old, not more than 150 years)
    const age = today.getFullYear() - selectedDate.getFullYear();
    if (age < 1) {
      this.dateError = 'Date of birth must be at least 1 year ago';
      return false;
    }
    
    if (age > 150) {
      this.dateError = 'Please enter a valid date of birth';
      return false;
    }
    
    this.dateError = '';
    return true;
  }
  
  checkEmailUniqueness(): void {
    const email = this.userData.email?.trim();
    
    if (!email) {
      this.emailError = '';
      this.emailExists = false;
      this.emailChecking = false;
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (this.submitted || this.touchedFields.has('email')) {
        this.emailError = 'Please enter a valid email address';
      }
      this.emailExists = false;
      this.emailChecking = false;
      return;
    }
    
    this.emailChecking = true;
    this.emailError = '';
    
    // Use the new check-email endpoint from UsersController
    this.userService.checkEmailExists(email).subscribe({
      next: (response) => {
        this.emailExists = response.exists;
        if (response.exists) {
          if (this.submitted || this.touchedFields.has('email')) {
            this.emailError = response.message || 'This email is already registered';
          }
        } else {
          this.emailError = '';
        }
        this.emailChecking = false;
      },
      error: (error) => {
        // On error, don't block signup but show warning
        if (this.submitted || this.touchedFields.has('email')) {
          this.emailError = 'Unable to verify email. You can continue, but email must be unique.';
        }
        this.emailExists = false;
        this.emailChecking = false;
      }
    });
  }

  checkPhoneUniqueness(): void {
    const phone = this.userData.mobilePhone?.trim();
    
    if (!phone) {
      this.phoneExists = false;
      this.phoneError = '';
      this.phoneChecking = false;
      return;
    }
    
    this.phoneChecking = true;
    this.phoneError = '';
    
    // Use the new check-phone endpoint from UsersController
    this.userService.checkPhoneExists(phone).subscribe({
      next: (response) => {
        this.phoneExists = response.exists;
        if (response.exists) {
          if (this.submitted || this.touchedFields.has('mobilePhone')) {
            this.phoneError = response.message || 'This phone number is already registered';
          }
        } else {
          this.phoneError = '';
        }
        this.phoneChecking = false;
      },
      error: (error) => {
        // On error, don't block signup but show warning
        if (this.submitted || this.touchedFields.has('mobilePhone')) {
          this.phoneError = 'Unable to verify phone number. You can continue, but phone must be unique.';
        }
        this.phoneExists = false;
        this.phoneChecking = false;
      }
    });
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

  // Helper to check if a field should show error
  shouldShowError(fieldName: string): boolean {
    return this.submitted || this.touchedFields.has(fieldName);
  }

  // Mark a field as touched
  markFieldAsTouched(fieldName: string): void {
    this.touchedFields.add(fieldName);
  }

  // Handle field input - clear error when user starts typing
  onFieldInput(fieldName: string): void {
    // Clear error for this field when user starts typing
    if (fieldName === 'email') {
      this.emailError = '';
      this.emailExists = false;
    } else if (fieldName === 'mobilePhone') {
      this.phoneError = '';
      this.phoneExists = false;
    } else if (fieldName === 'password') {
      this.passwordError = '';
    } else if (fieldName === 'dateOfBirth') {
      this.dateError = '';
    }
    this.errorMessage = '';
  }

  // Handle field blur - validate and mark as touched
  onFieldBlur(fieldName: string): void {
    this.markFieldAsTouched(fieldName);
    // Re-validate the form to show errors for touched fields
    if (fieldName === 'email') {
      this.checkEmailUniqueness();
    } else if (fieldName === 'mobilePhone') {
      this.checkPhoneUniqueness();
    } else if (fieldName === 'password') {
      this.validatePasswordComplexity();
    } else if (fieldName === 'dateOfBirth') {
      this.validateDateOfBirth();
    }
  }

  validateStep1(): boolean {
    // Clear previous errors (but keep them if field was touched or form was submitted)
    let isValid = true;
    
    // Check all required fields
    if (!this.userData.firstName?.trim()) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.errorMessage = 'First Name is required';
      }
      isValid = false;
    } else if (this.userData.firstName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.errorMessage = 'First name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.userData.firstName.trim())) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.errorMessage = 'First Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }
    
    if (!this.userData.lastName?.trim()) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.errorMessage = 'Last Name is required';
      }
      isValid = false;
    } else if (this.userData.lastName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.errorMessage = 'Last name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.userData.lastName.trim())) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.errorMessage = 'Last Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }
    
    if (!this.userData.email?.trim()) {
      if (this.submitted || this.touchedFields.has('email')) {
        this.emailError = 'Email is required';
      }
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.userData.email.trim())) {
        if (this.submitted || this.touchedFields.has('email')) {
          this.emailError = 'Please enter a valid email address';
        }
        isValid = false;
      } else if (this.emailExists) {
        if (this.submitted || this.touchedFields.has('email')) {
          this.emailError = 'This email is already registered';
        }
        isValid = false;
      }
    }
    
    if (this.emailChecking) {
      if (this.submitted || this.touchedFields.has('email')) {
        this.emailError = 'Please wait while we verify your email...';
      }
      isValid = false;
    }
    
    if (!this.userData.mobilePhone?.trim()) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.phoneError = 'Mobile Phone is required';
      }
      isValid = false;
    } else if (this.userData.mobilePhone.trim().length > 50) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.phoneError = 'Mobile phone must not exceed 50 characters';
      }
      isValid = false;
    } else if (this.phoneExists) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.phoneError = 'This phone number is already registered';
      }
      isValid = false;
    }
    
    if (this.phoneChecking) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.phoneError = 'Please wait while we verify your phone number...';
      }
      isValid = false;
    }
    
    if (!this.userData.password) {
      if (this.submitted || this.touchedFields.has('password')) {
        this.passwordError = 'Password is required';
      }
      isValid = false;
    } else if (!this.validatePasswordComplexity()) {
      // validatePasswordComplexity already sets passwordError
      isValid = false;
    }
    
    if (!this.userData.confirmPassword) {
      if (this.submitted || this.touchedFields.has('confirmPassword')) {
        this.errorMessage = 'Please confirm your password';
      }
      isValid = false;
    } else if (!this.passwordsMatch()) {
      if (this.submitted || this.touchedFields.has('confirmPassword')) {
        this.errorMessage = 'Passwords do not match';
      }
      isValid = false;
    }
    
    if (!this.userData.dateOfBirth) {
      if (this.submitted || this.touchedFields.has('dateOfBirth')) {
        this.dateError = 'Date of birth is required';
      }
      isValid = false;
    } else if (!this.validateDateOfBirth()) {
      // validateDateOfBirth already sets dateError
      isValid = false;
    }
    
    if (!this.userData.gender) {
      if (this.submitted || this.touchedFields.has('gender')) {
        this.errorMessage = 'Gender is required';
      }
      isValid = false;
    }
    
    if (!this.userData.mitrialStatus) {
      if (this.submitted || this.touchedFields.has('mitrialStatus')) {
        this.errorMessage = 'Marital Status is required';
      }
      isValid = false;
    }

    // Check terms acceptance
    if (!this.acceptTerms) {
      if (this.submitted || this.touchedFields.has('acceptTerms')) {
        this.errorMessage = 'Please accept the terms and conditions';
      }
      isValid = false;
    }

    return isValid;
  }

  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  isFormValid(): boolean {
    // Only perform full validation on fields that have been touched or when form is submitted
    if (!this.submitted && this.touchedFields.size === 0) {
      return false; // Form is not valid until user interacts with it
    }
    
    return this.validateStep1();
  }

  onStep1Submit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    // Mark as submitted to show all errors
    this.submitted = true;
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

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
