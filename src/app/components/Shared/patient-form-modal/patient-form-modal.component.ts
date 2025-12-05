// patient-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient, UpdatePatientDto } from '../../../models/patient.model';
import { Subscription } from 'rxjs';
import { PatientsService } from '../../../services/patients.service';

@Component({
  selector: 'app-patient-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-form-modal.component.html',
  styleUrls: ['./patient-form-modal.component.css']
})
export class PatientFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() selectedPatient: Patient | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UpdatePatientDto>();
  @Output() imageSelected = new EventEmitter<string>();

  // Store original patient data for comparison in edit mode
  private originalPatient: Patient | null = null;

  // Patient form data
  patientForm: {
    firstName: string;
    lastName: string;
    mobilePhone: string;
    gender: string;
    mitrialStatus: string;
    profileImage: string | null;
  } = this.getInitialFormState();

  // Image preview for form
  profileImagePreview: string = '';
  errorMessage: string = '';
  submitted = false;
  fieldErrors: {
    firstName?: string;
    lastName?: string;
    mobilePhone?: string;
    gender?: string;
    mitrialStatus?: string;
    profileImage?: string;
  } = {};

  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

  // Validation flags
  isPhoneValidating: boolean = false;
  phoneExists: boolean = false;

  private formChangesSub!: Subscription;

  constructor(private patientsService: PatientsService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload form data when modal becomes visible or selectedPatient changes
    if (changes['isVisible']) {
      if (this.isVisible) {
        // Modal just opened - initialize form based on mode
        console.log('🔓 Patient Modal opened:', {
          isEditMode: this.isEditMode,
          hasSelectedPatient: !!this.selectedPatient,
          selectedPatientId: this.selectedPatient?.id
        });
        
        // Wait a bit longer to ensure all inputs are properly set
        setTimeout(() => {
          if (this.isEditMode && this.selectedPatient) {
            // Edit mode: load current patient data
            console.log('📋 Loading patient data into edit form');
            this.initializeForm();
          }
        }, 100);
      } else {
        // Modal closed - clear error message
        this.errorMessage = '';
      }
    } else if (changes['selectedPatient'] && this.isVisible && this.isEditMode) {
      // Selected patient changed while modal is open - reload the form
      console.log('🔄 Selected patient changed, reloading form');
      if (this.selectedPatient) {
        setTimeout(() => {
          this.initializeForm();
        }, 50);
      }
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
      mobilePhone: '',
      gender: '',
      mitrialStatus: '',
      profileImage: null
    };
  }

  initializeForm() {
    if (this.isEditMode && this.selectedPatient) {
      // Populate form with existing patient data for edit mode
      this.populateEditForm();
    } else {
      // Reset form
      this.originalPatient = null;
      this.resetForm();
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
    if (!this.selectedPatient) {
      console.warn('⚠️ Cannot populate edit form: selectedPatient is null');
      return;
    }

    console.log('📝 Populating edit form with patient data:', {
      id: this.selectedPatient.id,
      fullName: this.selectedPatient.fullName,
      firstName: this.selectedPatient.firstName,
      lastName: this.selectedPatient.lastName,
      mobilePhone: this.selectedPatient.mobilePhone,
      profileImage: this.selectedPatient.profileImage
    });

    // Store original patient data for comparison (deep copy)
    this.originalPatient = { ...this.selectedPatient };

    // Populate form with current patient data
    this.patientForm = {
      firstName: this.selectedPatient.firstName || '',
      lastName: this.selectedPatient.lastName || '',
      mobilePhone: this.selectedPatient.mobilePhone || '',
      gender: this.selectedPatient.gender || '',
      mitrialStatus: this.selectedPatient.mitrialStatus || '',
      profileImage: this.selectedPatient.profileImage || null
    };
    
    // Set image preview
    this.profileImagePreview = this.selectedPatient.profileImage || '';
    
    console.log('✅ Edit form populated:', {
      firstName: this.patientForm.firstName,
      lastName: this.patientForm.lastName,
      mobilePhone: this.patientForm.mobilePhone,
      hasImage: !!this.profileImagePreview
    });
  }

  private resetForm() {
    this.patientForm = this.getInitialFormState();
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
        this.patientForm.profileImage = e.target.result;
        this.fieldErrors.profileImage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.patientForm.profileImage = null;
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
    if (fieldName === 'mobilePhone') {
      this.checkPhoneUnique();
    }
    this.validateForm();
  }

  // Check if phone number is unique
  checkPhoneUnique(): void {
    const phone = this.patientForm.mobilePhone?.trim();
    if (!phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    // Skip validation if phone hasn't changed in edit mode
    if (this.isEditMode && this.originalPatient && this.originalPatient.mobilePhone === phone) {
      this.phoneExists = false;
      this.isPhoneValidating = false;
      return;
    }
    
    this.isPhoneValidating = true;
    const userId = this.isEditMode && this.originalPatient ? this.originalPatient.id : undefined;
    
    this.patientsService.checkPhoneExists(phone, userId).subscribe({
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
    if (!this.patientForm.firstName?.trim()) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name is required';
      }
      isValid = false;
    } else if (this.patientForm.firstName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.patientForm.firstName.trim())) {
      if (this.submitted || this.touchedFields.has('firstName')) {
        this.fieldErrors.firstName = 'First Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Validate Last Name
    if (!this.patientForm.lastName?.trim()) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name is required';
      }
      isValid = false;
    } else if (this.patientForm.lastName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name must not exceed 100 characters';
      }
      isValid = false;
    } else if (!/^[a-zA-Z\s\-']+$/.test(this.patientForm.lastName.trim())) {
      if (this.submitted || this.touchedFields.has('lastName')) {
        this.fieldErrors.lastName = 'Last Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      isValid = false;
    }

    // Validate Mobile Phone (required)
    if (!this.patientForm.mobilePhone?.trim()) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile Phone is required';
      }
      isValid = false;
    } else if (this.patientForm.mobilePhone.trim().length > 50) {
      if (this.submitted || this.touchedFields.has('mobilePhone')) {
        this.fieldErrors.mobilePhone = 'Mobile Phone must not exceed 50 characters';
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
    if (!this.patientForm.gender?.trim()) {
      if (this.submitted || this.touchedFields.has('gender')) {
        this.fieldErrors.gender = 'Gender is required';
      }
      isValid = false;
    }

    // Validate Marital Status (required)
    if (!this.patientForm.mitrialStatus?.trim()) {
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

    if (this.isEditMode && this.originalPatient) {
      // Build UpdatePatientDto with only changed fields
      const updateData: UpdatePatientDto = {};

      if (this.patientForm.firstName.trim() !== this.originalPatient.firstName) {
        updateData.firstName = this.patientForm.firstName.trim();
      }

      if (this.patientForm.lastName.trim() !== this.originalPatient.lastName) {
        updateData.lastName = this.patientForm.lastName.trim();
      }

      if (this.patientForm.mobilePhone.trim() !== (this.originalPatient.mobilePhone || '')) {
        updateData.mobilePhone = this.patientForm.mobilePhone.trim();
      }

      if (this.patientForm.gender !== this.originalPatient.gender) {
        updateData.gender = this.patientForm.gender;
      }

      if (this.patientForm.mitrialStatus !== this.originalPatient.mitrialStatus) {
        updateData.mitrialStatus = this.patientForm.mitrialStatus;
      }

      if (this.patientForm.profileImage !== (this.originalPatient.profileImage || null)) {
        updateData.profileImage = this.patientForm.profileImage;
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