// nurse-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Nurse, CreateNurseDto, UpdateNurseDto } from '../../../models/nurse.model';
import { Subscription } from 'rxjs';
import { NursesService } from '../../../services/nurses.service';

@Component({
  selector: 'app-nurse-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-form-modal.component.html',
  styleUrls: ['./nurse-form-modal.component.css']
})
export class NurseFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() selectedNurse: Nurse | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateNurseDto | UpdateNurseDto>();
  @Output() imageSelected = new EventEmitter<string>();

  // Store original nurse data for comparison in edit mode
  private originalNurse: Nurse | null = null;

  // Nurse form data
  nurseForm: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    password: string;
    gender: string;
    mitrialStatus: string;
    dateOfBirth: string;
    bio: string;
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
    dateOfBirth?: string;
    gender?: string;
    mitrialStatus?: string;
    bio?: string;
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

  constructor(private nursesService: NursesService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload form data when modal becomes visible or selectedNurse changes
    if (changes['isVisible']) {
      if (this.isVisible) {
        // Modal just opened - initialize form based on mode
        console.log('🔓 Nurse Modal opened:', {
          isEditMode: this.isEditMode,
          hasSelectedNurse: !!this.selectedNurse,
          selectedNurseId: this.selectedNurse?.nurseId
        });
        
        // Wait a bit longer to ensure all inputs are properly set
        setTimeout(() => {
          if (this.isEditMode && this.selectedNurse) {
            // Edit mode: load current nurse data
            console.log('📋 Loading nurse data into edit form');
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
    } else if (changes['selectedNurse'] && this.isVisible && this.isEditMode) {
      // Selected nurse changed while modal is open - reload the form
      console.log('🔄 Selected nurse changed, reloading form');
      if (this.selectedNurse) {
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
      bio: '',
      profileImage: null
    };
  }

  initializeForm() {
    if (this.isEditMode && this.selectedNurse) {
      // Populate form with existing nurse data for edit mode
      this.populateEditForm();
    } else {
      // Reset form for create mode
      this.originalNurse = null;
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
    if (!this.selectedNurse) {
      console.warn('⚠️ Cannot populate edit form: selectedNurse is null');
      return;
    }

    console.log('📝 Populating edit form with nurse data:', {
      nurseId: this.selectedNurse.nurseId,
      fullName: this.selectedNurse.fullName,
      firstName: this.selectedNurse.firstName,
      lastName: this.selectedNurse.lastName,
      mobilePhone: this.selectedNurse.mobilePhone,
      photoUrl: this.selectedNurse.photoUrl
    });

    // Store original nurse data for comparison (deep copy)
    this.originalNurse = { ...this.selectedNurse };

    // Format date for HTML date input (YYYY-MM-DD)
    let formattedDate = '';
    if (this.selectedNurse.dateOfBirth) {
      const date = new Date(this.selectedNurse.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    // Populate form with current nurse data
    this.nurseForm = {
      firstName: this.selectedNurse.firstName || '',
      lastName: this.selectedNurse.lastName || '',
      email: this.selectedNurse.email || '',
      mobilePhone: this.selectedNurse.mobilePhone || '',
      password: '', // Password not used in edit mode
      gender: this.selectedNurse.gender || '',
      mitrialStatus: '', // Marital status - not in Nurse model, will be empty initially
      dateOfBirth: formattedDate,
      bio: this.selectedNurse.bio || '',
      profileImage: this.selectedNurse.photoUrl || null
    };
    
    // Set image preview
    this.profileImagePreview = this.selectedNurse.photoUrl || '';
    
    console.log('✅ Edit form populated:', {
      firstName: this.nurseForm.firstName,
      lastName: this.nurseForm.lastName,
      mobilePhone: this.nurseForm.mobilePhone,
      hasImage: !!this.profileImagePreview
    });
  }

  private resetCreateForm() {
    this.nurseForm = this.getInitialFormState();
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
        this.nurseForm.profileImage = e.target.result;
        this.fieldErrors.profileImage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.nurseForm.profileImage = null;
    this.markFieldAsTouched('profileImage');
    if (this.submitted || this.touchedFields.has('profileImage')) {
      this.fieldErrors.profileImage = '';
    }
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
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
    const email = this.nurseForm.email?.trim();
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
    if (this.isEditMode && this.originalNurse && this.originalNurse.email?.toLowerCase() === email.toLowerCase()) {
      this.emailExists = false;
      this.isEmailValidating = false;
      return;
    }
    
    this.isEmailValidating = true;
    const userId = this.isEditMode && this.originalNurse ? this.originalNurse.userId : undefined;
    
    this.nursesService.checkEmailExists(email, userId).subscribe({
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
    const phone = this.nurseForm.mobilePhone?.trim();
    if (!phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    // Skip validation if phone hasn't changed in edit mode
    if (this.isEditMode && this.originalNurse && this.originalNurse.mobilePhone === phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    this.isPhoneValidating = true;
    const userId = this.isEditMode && this.originalNurse ? this.originalNurse.userId : undefined;
    
    this.nursesService.checkPhoneExists(phone, userId).subscribe({
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
    if (!this.nurseForm.firstName?.trim()) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name is required';
      }
      isValid = false;
    } else if (this.nurseForm.firstName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.nurseForm.firstName.trim())) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Validate Last Name
    if (!this.nurseForm.lastName?.trim()) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name is required';
      }
      isValid = false;
    } else if (this.nurseForm.lastName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.nurseForm.lastName.trim())) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      // Validate Email
      if (!this.nurseForm.email?.trim()) {
        if (this.submitted || this.touchedFields.has('email')) {
          this.fieldErrors.email = 'Email is required';
        }
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.nurseForm.email.trim())) {
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
      if (!this.nurseForm.password?.trim()) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password is required';
        }
        isValid = false;
      } else if (this.nurseForm.password.length < 8) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password must be at least 8 characters long';
        }
        isValid = false;
      } else {
        // Complex password validation
        const hasUpperCase = /[A-Z]/.test(this.nurseForm.password);
        const hasLowerCase = /[a-z]/.test(this.nurseForm.password);
        const hasNumber = /[0-9]/.test(this.nurseForm.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.nurseForm.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          if (this.submitted || this.touchedFields.has('password')) {
            this.fieldErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          }
          isValid = false;
        }
      }
    }

    // Validate Mobile Phone (required)
    if (!this.nurseForm.mobilePhone?.trim()) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile Phone is required';
      }
      isValid = false;
    } else if (this.nurseForm.mobilePhone.trim().length > 50) {
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
    if (!this.nurseForm.gender?.trim()) {
      if (this.submitted || this.touchedFields.has('gender')) {
        this.fieldErrors.gender = 'Gender is required';
      }
      isValid = false;
    }

    // Validate Marital Status (required)
    if (!this.nurseForm.mitrialStatus?.trim()) {
      if (this.submitted || this.touchedFields.has('mitrialStatus')) {
        this.fieldErrors.mitrialStatus = 'Marital Status is required';
      }
      isValid = false;
    }

    // Validate Date of Birth (required)
    if (!this.nurseForm.dateOfBirth?.trim()) {
      if (this.submitted || this.touchedFields.has('dateOfBirth')) {
        this.fieldErrors.dateOfBirth = 'Date of Birth is required';
      }
      isValid = false;
    } else {
      const dob = new Date(this.nurseForm.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        if (this.submitted || this.touchedFields.has('dateOfBirth')) {
          this.fieldErrors.dateOfBirth = 'Date of birth cannot be in the future';
        }
        isValid = false;
      }
    }

    // Validate Bio (required)
    if (!this.nurseForm.bio?.trim()) {
      if (this.submitted || this.touchedFields.has('bio')) {
        this.fieldErrors.bio = 'Bio is required';
      }
      isValid = false;
    } else if (this.nurseForm.bio.trim().length > 1000) {
      if (this.submitted || this.touchedFields.has('bio')) {
        this.fieldErrors.bio = 'Bio must not exceed 1000 characters';
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

    if (this.isEditMode && this.originalNurse) {
      // Build UpdateNurseDto with only changed editable fields
      // Editable fields: firstName, lastName, mobilePhone, profileImage, mitrialStatus
      const updateData: UpdateNurseDto = {};

      if (this.nurseForm.firstName.trim() !== this.originalNurse.firstName) {
        updateData.firstName = this.nurseForm.firstName.trim();
      }

      if (this.nurseForm.lastName.trim() !== this.originalNurse.lastName) {
        updateData.lastName = this.nurseForm.lastName.trim();
      }

      if (this.nurseForm.mobilePhone.trim() !== (this.originalNurse.mobilePhone || '')) {
        updateData.mobilePhone = this.nurseForm.mobilePhone.trim();
      }

      if (this.nurseForm.profileImage !== (this.originalNurse.photoUrl || null)) {
        updateData.profileImage = this.nurseForm.profileImage;
      }

      // Track mitrialStatus changes
      if (this.nurseForm.mitrialStatus && this.nurseForm.mitrialStatus.trim() !== '') {
        updateData.mitrialStatus = this.nurseForm.mitrialStatus;
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
      // Prepare CreateNurseDto for new nurse
      // Ensure dateOfBirth is properly formatted
      let dateOfBirth: string;
      if (this.nurseForm.dateOfBirth) {
        try {
          const date = new Date(this.nurseForm.dateOfBirth);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date provided, using current date');
            dateOfBirth = new Date().toISOString();
          } else {
            dateOfBirth = date.toISOString();
          }
        } catch (e) {
          console.warn('Error parsing date, using current date:', e);
          dateOfBirth = new Date().toISOString();
        }
      } else {
        dateOfBirth = new Date().toISOString();
      }

      const formData: CreateNurseDto = {
        firstName: this.nurseForm.firstName.trim(),
        lastName: this.nurseForm.lastName.trim(),
        email: this.nurseForm.email.trim(),
        mobilePhone: this.nurseForm.mobilePhone?.trim() || '',
        password: this.nurseForm.password,
        gender: this.nurseForm.gender || 'Male',
        mitrialStatus: this.nurseForm.mitrialStatus || 'Single',
        profileImage: this.nurseForm.profileImage || null,
        dateOfBirth: dateOfBirth,
        bio: this.nurseForm.bio?.trim() || ''
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