// doctor-form-modal.component.ts - WITH IMPROVED VALIDATION DISPLAY LOGIC
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor, CreateDoctorDto, UpdateDoctorDto } from '../../../models/doctor.model';
import { Subscription } from 'rxjs';
import { DoctorsService } from '../../../services/doctors.service';

@Component({
  selector: 'app-doctor-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-form-modal.component.html',
  styleUrls: ['./doctor-form-modal.component.css']
})
export class DoctorFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() selectedDoctor: Doctor | null = null;
  @Input() specialties: string[] = [];
  @Input() isLoading: boolean = false;
  @Input() existingEmails: string[] = [];
  @Input() existingPhoneNumbers: string[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateDoctorDto | UpdateDoctorDto>();
  @Output() imageSelected = new EventEmitter<string>();
  @Output() checkEmail = new EventEmitter<string>();
  @Output() checkPhone = new EventEmitter<string>();

  // Store original doctor data for comparison in edit mode
  private originalDoctor: Doctor | null = null;

  // Doctor form data
  doctorForm: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    password: string;
    gender: string;
    mitrialStatus: string;
    dateOfBirth: string;
    bio: string;
    specialization: string;
    type: string;
    experienceYears: number | null;
    profileImage: string | null;
  } = this.getInitialFormState();

  // Image preview for form
  profileImagePreview: string = '';
  errorMessage: string = '';
  submitted = false;
  
  // Field errors - only show after submit attempt
  fieldErrors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    specialization?: string;
    mobilePhone?: string;
    dateOfBirth?: string;
    gender?: string;
    mitrialStatus?: string;
    type?: string;
    experienceYears?: string;
    bio?: string;
    profileImage?: string;
  } = {};

  // Validation flags
  isEmailValidating: boolean = false;
  isPhoneValidating: boolean = false;
  emailExists: boolean = false;
  phoneExists: boolean = false;
  
  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

  private formChangesSub!: Subscription;

  constructor(private doctorsService: DoctorsService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']) {
      if (this.isVisible) {
        // Modal just opened - initialize form based on mode
        console.log('🔓 Modal opened:', {
          isEditMode: this.isEditMode,
          hasSelectedDoctor: !!this.selectedDoctor,
          selectedDoctorId: this.selectedDoctor?.doctorId
        });
        
        // Wait a bit to ensure all inputs are properly set
        setTimeout(() => {
          if (this.isEditMode && this.selectedDoctor) {
            // Edit mode: load current doctor data
            console.log('📋 Loading doctor data into edit form');
            this.initializeForm();
          } else if (!this.isEditMode) {
            // Create mode: reset form
            this.initializeForm();
          }
        }, 100);
      } else {
        // Modal closed - clear error message and reset submission state
        this.errorMessage = '';
        this.submitted = false;
        this.clearAllFieldErrors();
        this.touchedFields.clear();
      }
    } else if (changes['selectedDoctor'] && this.isVisible && this.isEditMode) {
      // Selected doctor changed while modal is open - reload the form
      console.log('🔄 Selected doctor changed, reloading form');
      if (this.selectedDoctor) {
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
      specialization: '',
      type: '',
      experienceYears: null,
      profileImage: null
    };
  }

  initializeForm() {
    if (this.isEditMode && this.selectedDoctor) {
      // Populate form with existing doctor data for edit mode
      this.populateEditForm();
    } else {
      // Reset form for create mode
      this.originalDoctor = null;
      this.resetCreateForm();
    }
    this.errorMessage = '';
    this.emailExists = false;
    this.phoneExists = false;
    this.submitted = false;
    this.clearAllFieldErrors();
    this.touchedFields.clear();
  }

  private populateEditForm() {
    if (!this.selectedDoctor) {
      console.warn('⚠️ Cannot populate edit form: selectedDoctor is null');
      return;
    }

    console.log('📝 Populating edit form with doctor data:', {
      doctorId: this.selectedDoctor.doctorId,
      fullName: this.selectedDoctor.fullName,
      firstName: this.selectedDoctor.firstName,
      lastName: this.selectedDoctor.lastName,
      mobilePhone: this.selectedDoctor.mobilePhone,
      experienceYears: this.selectedDoctor.experienceYears,
      photoUrl: this.selectedDoctor.photoUrl
    });

    // Store original doctor data for comparison (deep copy)
    this.originalDoctor = { ...this.selectedDoctor };

    // Format date for HTML date input (YYYY-MM-DD)
    let formattedDate = '';
    if (this.selectedDoctor.dateOfBirth) {
      const date = new Date(this.selectedDoctor.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    // Populate form with current doctor data
    this.doctorForm = {
      firstName: this.selectedDoctor.firstName || '',
      lastName: this.selectedDoctor.lastName || '',
      email: this.selectedDoctor.email || '',
      mobilePhone: this.selectedDoctor.mobilePhone || '',
      password: '', // Password not used in edit mode
      gender: this.selectedDoctor.gender || '',
      mitrialStatus: '', // Marital status - not in Doctor model, will be empty initially
      dateOfBirth: formattedDate,
      bio: this.selectedDoctor.bio || '',
      specialization: this.selectedDoctor.specialization || '',
      type: this.selectedDoctor.type || '',
      experienceYears: this.selectedDoctor.experienceYears || 0,
      profileImage: this.selectedDoctor.photoUrl || null
    };
    
    // Set image preview
    this.profileImagePreview = this.selectedDoctor.photoUrl || '';
    
    console.log('✅ Edit form populated:', {
      firstName: this.doctorForm.firstName,
      lastName: this.doctorForm.lastName,
      mobilePhone: this.doctorForm.mobilePhone,
      experienceYears: this.doctorForm.experienceYears,
      hasImage: !!this.profileImagePreview
    });
  }

  private resetCreateForm() {
    this.doctorForm = this.getInitialFormState();
    this.profileImagePreview = '';
    this.emailExists = false;
    this.phoneExists = false;
  }

  private clearAllFieldErrors() {
    this.fieldErrors = {};
  }

  // Helper to check if a field should show error
  shouldShowError(fieldName: keyof typeof this.fieldErrors): boolean {
    return this.submitted || this.touchedFields.has(fieldName);
  }

  // Mark a field as touched
  markFieldAsTouched(fieldName: keyof typeof this.fieldErrors): void {
    this.touchedFields.add(fieldName);
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
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.fieldErrors.profileImage = 'Image size should be less than 5MB';
        return;
      }
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.doctorForm.profileImage = e.target.result;
        this.fieldErrors.profileImage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.doctorForm.profileImage = null;
    this.markFieldAsTouched('profileImage');
    if (this.submitted || this.touchedFields.has('profileImage')) {
      this.fieldErrors.profileImage = 'Profile image is required';
    }
  }

  // Check if email is unique
  checkEmailUnique(): void {
    const email = this.doctorForm.email?.trim();
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
    if (this.isEditMode && this.originalDoctor && this.originalDoctor.email?.toLowerCase() === email.toLowerCase()) {
      this.emailExists = false;
      this.isEmailValidating = false;
      return;
    }
    
    this.isEmailValidating = true;
    const userId = this.isEditMode && this.originalDoctor ? this.originalDoctor.userId : undefined;
    
    this.doctorsService.checkEmailExists(email, userId).subscribe({
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
    const phone = this.doctorForm.mobilePhone?.trim();
    if (!phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    // Skip validation if phone hasn't changed in edit mode
    if (this.isEditMode && this.originalDoctor && this.originalDoctor.mobilePhone === phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    this.isPhoneValidating = true;
    const userId = this.isEditMode && this.originalDoctor ? this.originalDoctor.userId : undefined;
    
    this.doctorsService.checkPhoneExists(phone, userId).subscribe({
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
    if (!this.doctorForm.firstName?.trim()) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name is required';
      }
      isValid = false;
    } else if (this.doctorForm.firstName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.doctorForm.firstName.trim())) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Validate Last Name
    if (!this.doctorForm.lastName?.trim()) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name is required';
      }
      isValid = false;
    } else if (this.doctorForm.lastName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.doctorForm.lastName.trim())) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      // Validate Email
      if (!this.doctorForm.email?.trim()) {
        if (this.submitted || this.touchedFields.has('email')) {
          this.fieldErrors.email = 'Email is required';
        }
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.doctorForm.email.trim())) {
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

      // Validate Password
      if (!this.doctorForm.password?.trim()) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password is required';
        }
        isValid = false;
      } else if (this.doctorForm.password.length < 8) {
        if (this.submitted || this.touchedFields.has('password')) {
          this.fieldErrors.password = 'Password must be at least 8 characters long';
        }
        isValid = false;
      } else {
        // Complex password validation
        const hasUpperCase = /[A-Z]/.test(this.doctorForm.password);
        const hasLowerCase = /[a-z]/.test(this.doctorForm.password);
        const hasNumber = /[0-9]/.test(this.doctorForm.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.doctorForm.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          if (this.submitted || this.touchedFields.has('password')) {
            this.fieldErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          }
          isValid = false;
        }
      }

      // Validate Specialization
      if (!this.doctorForm.specialization?.trim()) {
        if (this.submitted || this.touchedFields.has('specialization')) {
          this.fieldErrors.specialization = 'Specialization is required';
        }
        isValid = false;
      }
    }

    // Validate Mobile Phone
    if (!this.doctorForm.mobilePhone?.trim()) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile phone is required';
      }
      isValid = false;
    } else if (this.doctorForm.mobilePhone.trim().length > 50) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile phone must not exceed 50 characters';
      }
      isValid = false;
    } else if (!/^[0-9+\-\s()]+$/.test(this.doctorForm.mobilePhone.trim())) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile phone can only contain numbers, plus, hyphen, space, and parentheses';
      }
      isValid = false;
    } else if (this.phoneExists) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Phone number is already registered';
      }
      isValid = false;
    }

    // Validate Gender
    if (!this.doctorForm.gender?.trim()) {
      if (this.submitted || this.touchedFields.has('gender')) {
        this.fieldErrors.gender = 'Gender is required';
      }
      isValid = false;
    }

    // Validate Marital Status
    if (!this.doctorForm.mitrialStatus?.trim()) {
      if (this.submitted || this.touchedFields.has('mitrialStatus')) {
        this.fieldErrors.mitrialStatus = 'Marital status is required';
      }
      isValid = false;
    }

    // Validate Date of Birth
    if (!this.doctorForm.dateOfBirth) {
      if (this.submitted || this.touchedFields.has('dateOfBirth')) {
        this.fieldErrors.dateOfBirth = 'Date of birth is required';
      }
      isValid = false;
    } else {
      const dob = new Date(this.doctorForm.dateOfBirth);
      const today = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 150); // Max 150 years old
      
      if (dob > today) {
        if (this.submitted || this.touchedFields.has('dateOfBirth')) {
          this.fieldErrors.dateOfBirth = 'Date of birth cannot be in the future';
        }
        isValid = false;
      } else if (dob < minAgeDate) {
        if (this.submitted || this.touchedFields.has('dateOfBirth')) {
          this.fieldErrors.dateOfBirth = 'Date of birth cannot be more than 150 years ago';
        }
        isValid = false;
      } else {
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 21) {
          if (this.submitted || this.touchedFields.has('dateOfBirth')) {
            this.fieldErrors.dateOfBirth = 'Doctor must be at least 21 years old';
          }
          isValid = false;
        }
      }
    }

    // Validate Type
    if (!this.doctorForm.type?.trim()) {
      if (this.submitted || this.touchedFields.has('type')) {
        this.fieldErrors.type = 'Doctor type is required';
      }
      isValid = false;
    }

    // Validate Experience Years
    if (this.doctorForm.experienceYears === null || this.doctorForm.experienceYears === undefined) {
      if (this.submitted || this.touchedFields.has('experienceYears')) {
        this.fieldErrors.experienceYears = 'Experience years is required';
      }
      isValid = false;
    } else if (this.doctorForm.experienceYears < 0) {
      if (this.submitted || this.touchedFields.has('experienceYears')) {
        this.fieldErrors.experienceYears = 'Experience years cannot be negative';
      }
      isValid = false;
    } else if (this.doctorForm.experienceYears > 100) {
      if (this.submitted || this.touchedFields.has('experienceYears')) {
        this.fieldErrors.experienceYears = 'Experience years cannot exceed 100';
      }
      isValid = false;
    }

    // Validate Bio
    if (!this.doctorForm.bio?.trim()) {
      if (this.submitted || this.touchedFields.has('bio')) {
        this.fieldErrors.bio = 'Bio is required';
      }
      isValid = false;
    } else if (this.doctorForm.bio.trim().length > 1000) {
      if (this.submitted || this.touchedFields.has('bio')) {
        this.fieldErrors.bio = 'Bio must not exceed 1000 characters';
      }
      isValid = false;
    }

    // Validate Profile Image
    if (!this.doctorForm.profileImage && !this.isEditMode) {
      if (this.submitted || this.touchedFields.has('profileImage')) {
        this.fieldErrors.profileImage = 'Profile image is required';
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
    
    const isValid = this.validateForm() && !this.emailExists && !this.phoneExists;
    
    // For create mode, also check that all required fields have some value
    if (!this.isEditMode && !this.submitted) {
      const hasAllRequiredFields = Boolean(
        this.doctorForm.firstName.trim() &&
        this.doctorForm.lastName.trim() &&
        this.doctorForm.email.trim() &&
        this.doctorForm.password &&
        this.doctorForm.mobilePhone.trim() &&
        this.doctorForm.gender.trim() &&
        this.doctorForm.mitrialStatus.trim() &&
        this.doctorForm.dateOfBirth &&
        this.doctorForm.specialization.trim() &&
        this.doctorForm.type.trim() &&
        this.doctorForm.experienceYears !== null &&
        this.doctorForm.bio.trim() &&
        !!this.doctorForm.profileImage
      );

      return isValid && hasAllRequiredFields;
    }
    
    return isValid;
  }

  onFieldBlur(fieldName: keyof typeof this.fieldErrors): void {
    // Mark field as touched
    this.markFieldAsTouched(fieldName);
    
    // Validate specific field
    switch (fieldName) {
      case 'email':
        this.checkEmailUnique();
        break;
      case 'mobilePhone':
        this.checkPhoneUnique();
        break;
    }
    
    // Validate the field
    this.validateForm();
  }

  onFieldInput(fieldName: keyof typeof this.fieldErrors): void {
    // Clear error when user starts typing
    this.fieldErrors[fieldName] = '';
  }

  onSubmit() {
    this.submitted = true;
    
    // Mark all fields as touched on submit
    Object.keys(this.fieldErrors).forEach(key => {
      this.markFieldAsTouched(key as keyof typeof this.fieldErrors);
    });
    
    if (!this.validateForm()) {
      return;
    }

    // Double-check unique constraints
    if (!this.isEditMode) {
      this.checkEmailUnique();
      if (this.emailExists) {
        this.errorMessage = 'Email is already registered. Please use a different email.';
        return;
      }
    }
    
    this.checkPhoneUnique();
    if (this.phoneExists) {
      this.errorMessage = 'Phone number is already registered. Please use a different phone number.';
      return;
    }

    if (this.isEditMode && this.originalDoctor) {
      // Build UpdateDoctorDto with only changed editable fields
      const updateData: UpdateDoctorDto = {};

      if (this.doctorForm.firstName.trim() !== this.originalDoctor.firstName) {
        updateData.firstName = this.doctorForm.firstName.trim();
      }

      if (this.doctorForm.lastName.trim() !== this.originalDoctor.lastName) {
        updateData.lastName = this.doctorForm.lastName.trim();
      }

      if (this.doctorForm.mobilePhone.trim() !== (this.originalDoctor.mobilePhone || '')) {
        updateData.mobilePhone = this.doctorForm.mobilePhone.trim();
      }

      if (this.doctorForm.experienceYears != null && this.doctorForm.experienceYears !== this.originalDoctor.experienceYears) {
        updateData.experienceYears = this.doctorForm.experienceYears;
      }

      if (this.doctorForm.profileImage !== (this.originalDoctor.photoUrl || null)) {
        updateData.profileImage = this.doctorForm.profileImage;
      }

      if (this.doctorForm.mitrialStatus && this.doctorForm.mitrialStatus.trim() !== '') {
        updateData.mitrialStatus = this.doctorForm.mitrialStatus;
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
      // Prepare CreateDoctorDto for new doctor
      const formData: CreateDoctorDto = {
        firstName: this.doctorForm.firstName.trim(),
        lastName: this.doctorForm.lastName.trim(),
        email: this.doctorForm.email.trim(),
        mobilePhone: this.doctorForm.mobilePhone.trim(),
        password: this.doctorForm.password,
        gender: this.doctorForm.gender,
        mitrialStatus: this.doctorForm.mitrialStatus,
        profileImage: this.doctorForm.profileImage,
        dateOfBirth: this.doctorForm.dateOfBirth 
          ? new Date(this.doctorForm.dateOfBirth).toISOString() 
          : new Date().toISOString(),
        bio: this.doctorForm.bio.trim(),
        specialization: this.doctorForm.specialization,
        type: this.doctorForm.type.trim(),
        experienceYears: this.doctorForm.experienceYears || 0
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

  getMaxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMinDate(): string {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  }
}