// admin-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Admin, CreateAdminDto, UpdateAdminDto } from '../../../models/admin.model';
import { Subscription } from 'rxjs';

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

  private formChangesSub!: Subscription;

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
        this.adminForm.profileImage = e.target.result;
        this.errorMessage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.adminForm.profileImage = null;
  }

  validateForm(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    // Basic validation for both create and edit modes
    if (!this.adminForm.firstName?.trim()) {
      this.errorMessage = 'First Name is required';
      return false;
    }

    if (!this.adminForm.lastName?.trim()) {
      this.errorMessage = 'Last Name is required';
      return false;
    }

    // Additional validation for create mode only
    if (!this.isEditMode) {
      if (!this.adminForm.email?.trim()) {
        this.errorMessage = 'Email is required for new admins';
        return false;
      }

      if (!this.adminForm.password?.trim()) {
        this.errorMessage = 'Password is required for new admins';
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.adminForm.email)) {
        this.errorMessage = 'Please enter a valid email address';
        return false;
      }

      // Password strength validation
      if (this.adminForm.password.length < 6) {
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