// nurse-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Nurse, CreateNurseDto, UpdateNurseDto } from '../../../models/nurse.model';
import { Subscription } from 'rxjs';

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

  private formChangesSub!: Subscription;

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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.nurseForm.profileImage = e.target.result;
        this.errorMessage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.nurseForm.profileImage = null;
  }

  validateForm(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    // Basic validation for both create and edit modes
    if (!this.nurseForm.firstName?.trim()) {
      this.errorMessage = 'First Name is required';
      return false;
    }

    if (!this.nurseForm.lastName?.trim()) {
      this.errorMessage = 'Last Name is required';
      return false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      if (!this.nurseForm.email?.trim()) {
        this.errorMessage = 'Email is required for new nurses';
        return false;
      }

      if (!this.nurseForm.password?.trim()) {
        this.errorMessage = 'Password is required for new nurses';
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.nurseForm.email)) {
        this.errorMessage = 'Please enter a valid email address';
        return false;
      }

      // Password strength validation
      if (this.nurseForm.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long';
        return false;
      }
    }

    return true;
  }

  onSubmit() {
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
      const formData: CreateNurseDto = {
        firstName: this.nurseForm.firstName.trim(),
        lastName: this.nurseForm.lastName.trim(),
        email: this.nurseForm.email.trim(),
        mobilePhone: this.nurseForm.mobilePhone.trim(),
        password: this.nurseForm.password,
        gender: this.nurseForm.gender,
        mitrialStatus: this.nurseForm.mitrialStatus,
        profileImage: this.nurseForm.profileImage,
        dateOfBirth: this.nurseForm.dateOfBirth 
          ? new Date(this.nurseForm.dateOfBirth).toISOString() 
          : new Date().toISOString(),
        bio: this.nurseForm.bio.trim()
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