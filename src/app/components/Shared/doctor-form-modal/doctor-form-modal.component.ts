// doctor-form-modal.component.ts - FIXED VERSION
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor, CreateDoctorDto, UpdateDoctorDto } from '../../../models/doctor.model';
import { Subscription } from 'rxjs';

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
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateDoctorDto | UpdateDoctorDto>();
  @Output() imageSelected = new EventEmitter<string>();

  // Store original doctor data for comparison in edit mode
  private originalDoctor: Doctor | null = null;

  // Doctor form data - using existing field names that work with backend
  doctorForm: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    password: string;
    gender: string;
    mitrialStatus: string; // KEEP original name that works with backend
    dateOfBirth: string;
    bio: string;
    specialization: string;
    type: string;
    experienceYears: number;
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
    // Reload form data when modal becomes visible or selectedDoctor changes
    if (changes['isVisible']) {
      if (this.isVisible) {
        // Modal just opened - initialize form based on mode
        console.log('🔓 Modal opened:', {
          isEditMode: this.isEditMode,
          hasSelectedDoctor: !!this.selectedDoctor,
          selectedDoctorId: this.selectedDoctor?.doctorId
        });
        
        // Wait a bit longer to ensure all inputs are properly set
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
        // Modal closed - clear error message
        this.errorMessage = '';
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
      mitrialStatus: '', // KEEP original name
      dateOfBirth: '',
      bio: '',
      specialization: '',
      type: '',
      experienceYears: 0,
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
        this.doctorForm.profileImage = e.target.result;
        this.errorMessage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.doctorForm.profileImage = null;
  }

  validateForm(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    // Basic validation for both create and edit modes
    if (!this.doctorForm.firstName?.trim()) {
      this.errorMessage = 'First Name is required';
      return false;
    }

    if (!this.doctorForm.lastName?.trim()) {
      this.errorMessage = 'Last Name is required';
      return false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      if (!this.doctorForm.specialization?.trim()) {
        this.errorMessage = 'Specialization is required';
        return false;
      }

      if (!this.doctorForm.email?.trim()) {
        this.errorMessage = 'Email is required for new doctors';
        return false;
      }

      if (!this.doctorForm.password?.trim()) {
        this.errorMessage = 'Password is required for new doctors';
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.doctorForm.email)) {
        this.errorMessage = 'Please enter a valid email address';
        return false;
      }

      // Password strength validation
      if (this.doctorForm.password.length < 6) {
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

    if (this.isEditMode && this.originalDoctor) {
      // Build UpdateDoctorDto with only changed editable fields
      // Editable fields: firstName, lastName, mobilePhone, profileImage, mitrialStatus, experienceYears
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

      if (this.doctorForm.experienceYears !== this.originalDoctor.experienceYears) {
        updateData.experienceYears = this.doctorForm.experienceYears;
      }

      if (this.doctorForm.profileImage !== (this.originalDoctor.photoUrl || null)) {
        updateData.profileImage = this.doctorForm.profileImage;
      }

      // Note: We track mitrialStatus changes but it may not be in the original doctor data
      // If the form value changed from empty to a value or vice versa, include it
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
        experienceYears: this.doctorForm.experienceYears
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