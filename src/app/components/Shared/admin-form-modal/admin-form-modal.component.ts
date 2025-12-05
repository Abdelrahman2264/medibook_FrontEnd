// admin-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Admin, CreateAdminDto, UpdateAdminDto } from '../../../models/admin.model';
import { Subscription } from 'rxjs';
import { AdminsService } from '../../../services/admins.service';

@Component({
  selector: 'app-admin-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-form-modal.component.html',
  styleUrls: ['./admin-form-modal.component.css']
})
export class AdminFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() selectedAdmin: Admin | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateAdminDto | UpdateAdminDto>();
  @Output() imageSelected = new EventEmitter<string>();

  // Store original admin data for comparison in edit mode
  private originalAdmin: Admin | null = null;

  // Admin form data
  adminForm: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    password: string;
    gender: string;
    mitrialStatus: string;
    dateOfBirth: string;
    profileImage: string | null;
  } = this.getInitialFormState();

  // Image preview for form
  profileImagePreview: string = '';
  errorMessage: string = '';
  submitted = false;
  fieldErrors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    mobilePhone?: string;
    gender?: string;
    mitrialStatus?: string;
    profileImage?: string;
  } = {};

  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

  // Validation flags
  isEmailValidating: boolean = false;
  isPhoneValidating: boolean = false;
  emailExists: boolean = false;
  phoneExists: boolean = false;

  private formChangesSub!: Subscription;

  constructor(private adminsService: AdminsService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload form data when modal becomes visible or selectedAdmin changes
    if (changes['isVisible']) {
      if (this.isVisible) {
        // Modal just opened - initialize form based on mode
        console.log('🔓 Admin Modal opened:', {
          isEditMode: this.isEditMode,
          hasSelectedAdmin: !!this.selectedAdmin,
          selectedAdminId: this.selectedAdmin?.id
        });
        
        // Wait a bit longer to ensure all inputs are properly set
        setTimeout(() => {
          if (this.isEditMode && this.selectedAdmin) {
            // Edit mode: load current admin data
            console.log('📋 Loading admin data into edit form');
            this.initializeForm();
          } else if (!this.isEditMode) {
            // Create mode: reset form
            this.initializeForm();
          }
        }, 100);
      } else {
        // Modal closed - clear error message
        this.errorMessage = '';
      }
    } else if (changes['selectedAdmin'] && this.isVisible && this.isEditMode) {
      // Selected admin changed while modal is open - reload the form
      console.log('🔄 Selected admin changed, reloading form');
      if (this.selectedAdmin) {
        setTimeout(() => {
          this.initializeForm();
        }, 50);
      }
    } else if (changes['isEditMode'] && this.isVisible) {
      // Edit mode changed - reinitialize form
      console.log('🔄 Edit mode changed, reinitializing form');
      setTimeout(() => {
        this.initializeForm();
      }, 50);
    }
  }

  ngOnDestroy() {
    if (this.formChangesSub) {
      this.formChangesSub.unsubscribe();
    }
  }

  private getInitialFormState() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      password: '',
      gender: '',
      mitrialStatus: '',
      dateOfBirth: '',
      profileImage: null
    };
  }

  initializeForm() {
    if (this.isEditMode && this.selectedAdmin) {
      // Populate form with existing admin data for edit mode
      this.populateEditForm();
    } else {
      // Reset form for create mode
      this.originalAdmin = null;
      this.resetCreateForm();
    }
    this.errorMessage = '';
    this.submitted = false;
    this.clearAllFieldErrors();
    this.touchedFields.clear();
  }

  private clearAllFieldErrors() {
    this.fieldErrors = {};
  }

  private populateEditForm() {
    if (!this.selectedAdmin) {
      console.warn('⚠️ Cannot populate edit form: selectedAdmin is null');
      return;
    }

    console.log('📝 Populating edit form with admin data:', {
      id: this.selectedAdmin.id,
      fullName: this.selectedAdmin.fullName,
      firstName: this.selectedAdmin.firstName,
      lastName: this.selectedAdmin.lastName,
      mobilePhone: this.selectedAdmin.mobilePhone,
      profileImage: this.selectedAdmin.profileImage
    });

    // Store original admin data for comparison (deep copy)
    this.originalAdmin = { ...this.selectedAdmin };

    // Format date for HTML date input (YYYY-MM-DD)
    let formattedDate = '';
    if (this.selectedAdmin.dateOfBirth) {
      const date = new Date(this.selectedAdmin.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    // Populate form with current admin data
    this.adminForm = {
      firstName: this.selectedAdmin.firstName || '',
      lastName: this.selectedAdmin.lastName || '',
      email: this.selectedAdmin.email || '',
      mobilePhone: this.selectedAdmin.mobilePhone || '',
      password: '', // Password not used in edit mode
      gender: this.selectedAdmin.gender || '',
      mitrialStatus: this.selectedAdmin.mitrialStatus || '',
      dateOfBirth: formattedDate,
      profileImage: this.selectedAdmin.profileImage || null
    };
    
    // Set image preview
    this.profileImagePreview = this.selectedAdmin.profileImage || '';
    
    console.log('✅ Edit form populated:', {
      firstName: this.adminForm.firstName,
      lastName: this.adminForm.lastName,
      mobilePhone: this.adminForm.mobilePhone,
      hasImage: !!this.profileImagePreview
    });
  }

  private resetCreateForm() {
    this.adminForm = this.getInitialFormState();
    this.profileImagePreview = '';
  }

  // Image upload handler
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Clear previous errors
      this.fieldErrors.profileImage = '';
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.fieldErrors.profileImage = 'Please select a valid image file (JPEG, PNG, GIF)';
        this.markFieldAsTouched('profileImage');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.fieldErrors.profileImage = 'Image size should be less than 5MB';
        this.markFieldAsTouched('profileImage');
        return;
      }
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.adminForm.profileImage = e.target.result;
        this.fieldErrors.profileImage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.adminForm.profileImage = null;
    this.markFieldAsTouched('profileImage');
    if (this.submitted || this.touchedFields.has('profileImage')) {
      this.fieldErrors.profileImage = '';
    }
  }

  // Helper to check if a field should show error
  shouldShowError(fieldName: keyof typeof this.fieldErrors): boolean {
    return this.submitted || this.touchedFields.has(fieldName);
  }

  // Mark a field as touched
  markFieldAsTouched(fieldName: keyof typeof this.fieldErrors): void {
    this.touchedFields.add(fieldName);
  }

  // Handle field input - clear error when user starts typing
  onFieldInput(fieldName: keyof typeof this.fieldErrors): void {
    // Clear error for this field when user starts typing
    if (this.fieldErrors[fieldName]) {
      this.fieldErrors[fieldName] = '';
    }
  }

  // Handle field blur - validate and mark as touched
  onFieldBlur(fieldName: keyof typeof this.fieldErrors): void {
    this.markFieldAsTouched(fieldName);
    // Re-validate the form to show errors for touched fields
    if (fieldName === 'email') {
      this.checkEmailUnique();
    } else if (fieldName === 'mobilePhone') {
      this.checkPhoneUnique();
    }
    this.validateForm();
  }

  // Check if email is unique
  checkEmailUnique(): void {
    const email = this.adminForm.email?.trim();
    if (!email) {
      this.emailExists = false;
      this.isEmailValidating = false;
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailExists = false;
      this.isEmailValidating = false;
      return;
    }
    
    // Skip validation if email hasn't changed in edit mode
    if (this.isEditMode && this.originalAdmin && this.originalAdmin.email?.toLowerCase() === email.toLowerCase()) {
      this.emailExists = false;
      this.isEmailValidating = false;
      return;
    }
    
    this.isEmailValidating = true;
    const userId = this.isEditMode && this.originalAdmin ? this.originalAdmin.id : undefined;
    
    this.adminsService.checkEmailExists(email, userId).subscribe({
      next: (response) => {
        this.emailExists = response.exists;
        if (response.exists && (this.submitted || this.touchedFields.has('email'))) {
          this.fieldErrors.email = response.message || 'Email is already registered';
        } else {
          this.fieldErrors.email = '';
        }
        this.isEmailValidating = false;
      },
      error: (error) => {
        console.error('Error checking email:', error);
        this.emailExists = false;
        this.isEmailValidating = false;
      }
    });
  }

  // Check if phone number is unique
  checkPhoneUnique(): void {
    const phone = this.adminForm.mobilePhone?.trim();
    if (!phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    // Skip validation if phone hasn't changed in edit mode
    if (this.isEditMode && this.originalAdmin && this.originalAdmin.mobilePhone === phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    this.isPhoneValidating = true;
    const userId = this.isEditMode && this.originalAdmin ? this.originalAdmin.id : undefined;
    
    this.adminsService.checkPhoneExists(phone, userId).subscribe({
      next: (response) => {
        this.phoneExists = response.exists;
        if (response.exists && (this.submitted || this.touchedFields.has('mobilePhone'))) {
          this.fieldErrors.mobilePhone = response.message || 'Phone number is already registered';
        } else {
          this.fieldErrors.mobilePhone = '';
        }
        this.isPhoneValidating = false;
      },
      error: (error) => {
        console.error('Error checking phone:', error);
        this.phoneExists = false;
        this.isPhoneValidating = false;
      }
    });
  }

  validateForm(): boolean {
    // Clear previous errors (but keep them if field was touched or form was submitted)
    const previousErrors = { ...this.fieldErrors };
    this.fieldErrors = {};
    let isValid = true;

    // Validate First Name
    if (!this.adminForm.firstName?.trim()) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name is required';
      }
      isValid = false;
    } else if (this.adminForm.firstName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.adminForm.firstName.trim())) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Validate Last Name
    if (!this.adminForm.lastName?.trim()) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name is required';
      }
      isValid = false;
    } else if (this.adminForm.lastName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.adminForm.lastName.trim())) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      // Validate Email
      if (!this.adminForm.email?.trim()) {
        if (this.submitted || this.touchedFields.has('email')) {
          this.fieldErrors.email = 'Email is required';
        }
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.adminForm.email.trim())) {
          if (this.submitted || this.touchedFields.has('email')) {
            this.fieldErrors.email = 'Please enter a valid email address';
          }
          isValid = false;
        } else if (this.emailExists) {
          if (this.submitted || this.touchedFields.has('email')) {
            this.fieldErrors.email = 'Email is already registered';
          }
          isValid = false;
        }
      }
      
      if (this.isEmailValidating) {
        isValid = false;
      }

      // Validate Password
      if (!this.adminForm.password?.trim()) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password is required';
        }
        isValid = false;
      } else if (this.adminForm.password.length < 8) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password must be at least 8 characters long';
        }
        isValid = false;
      } else {
        // Complex password validation
        const hasUpperCase = /[A-Z]/.test(this.adminForm.password);
        const hasLowerCase = /[a-z]/.test(this.adminForm.password);
        const hasNumber = /[0-9]/.test(this.adminForm.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.adminForm.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          if (this.submitted || this.touchedFields.has('password')) {
            this.fieldErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          }
          isValid = false;
        }
      }
    }

    // Validate Mobile Phone (required)
    if (!this.adminForm.mobilePhone?.trim()) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile Phone is required';
      }
      isValid = false;
    } else if (this.adminForm.mobilePhone.trim().length > 50) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile phone must not exceed 50 characters';
      }
      isValid = false;
    } else if (this.phoneExists) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Phone number is already registered';
      }
      isValid = false;
    }
    
    if (this.isPhoneValidating) {
      isValid = false;
    }

    // Validate Gender (required)
    if (!this.adminForm.gender?.trim()) {
      if (this.submitted || this.touchedFields.has('gender')) {
        this.fieldErrors.gender = 'Gender is required';
      }
      isValid = false;
    }

    // Validate Marital Status (required)
    if (!this.adminForm.mitrialStatus?.trim()) {
      if (this.submitted || this.touchedFields.has('mitrialStatus')) {
        this.fieldErrors.mitrialStatus = 'Marital Status is required';
      }
      isValid = false;
    }

    if (!isValid && this.submitted) {
      this.errorMessage = 'Please fix all validation errors before submitting';
    }

    return isValid;
  }

  isFormValid(): boolean {
    // Only perform full validation on fields that have been touched or when form is submitted
    if (!this.submitted && this.touchedFields.size === 0) {
      return false; // Form is not valid until user interacts with it
    }
    
    return this.validateForm();
  }

  onSubmit() {
    this.submitted = true;
    
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.originalAdmin) {
      // Build UpdateAdminDto with only changed fields
      const updateData: UpdateAdminDto = {};

      if (this.adminForm.firstName.trim() !== this.originalAdmin.firstName) {
        updateData.firstName = this.adminForm.firstName.trim();
      }

      if (this.adminForm.lastName.trim() !== this.originalAdmin.lastName) {
        updateData.lastName = this.adminForm.lastName.trim();
      }

      if (this.adminForm.mobilePhone.trim() !== (this.originalAdmin.mobilePhone || '')) {
        updateData.mobilePhone = this.adminForm.mobilePhone.trim();
      }

      if (this.adminForm.gender !== this.originalAdmin.gender) {
        updateData.gender = this.adminForm.gender;
      }

      if (this.adminForm.mitrialStatus !== this.originalAdmin.mitrialStatus) {
        updateData.mitrialStatus = this.adminForm.mitrialStatus;
      }

      if (this.adminForm.profileImage !== (this.originalAdmin.profileImage || null)) {
        updateData.profileImage = this.adminForm.profileImage;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        this.errorMessage = 'No changes detected';
        return;
      }

      console.log('Form submitted (EDIT):', {
        mode: 'EDIT',
        data: updateData
      });

      this.save.emit(updateData);
    } else {
      // Prepare CreateAdminDto for new admin
      const formData: CreateAdminDto = {
        firstName: this.adminForm.firstName.trim(),
        lastName: this.adminForm.lastName.trim(),
        email: this.adminForm.email.trim(),
        mobilePhone: this.adminForm.mobilePhone.trim(),
        password: this.adminForm.password,
        gender: this.adminForm.gender,
        mitrialStatus: this.adminForm.mitrialStatus,
        profileImage: this.adminForm.profileImage,
        dateOfBirth: this.adminForm.dateOfBirth 
          ? new Date(this.adminForm.dateOfBirth).toISOString() 
          : new Date().toISOString()
      };

      console.log('Form submitted (CREATE):', {
        mode: 'CREATE',
        data: { ...formData, password: formData.password ? '[REDACTED]' : '' }
      });

      this.save.emit(formData);
    }
  }

  onClose() {
    this.close.emit();
  }

  // Prevent modal close when clicking inside modal content
  onModalClick(event: Event) {
    event.stopPropagation();
  }
}