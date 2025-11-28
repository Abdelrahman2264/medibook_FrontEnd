// patient-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient, UpdatePatientDto } from '../../../models/patient.model';
import { Subscription } from 'rxjs';

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

  private formChangesSub!: Subscription;

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
        this.patientForm.profileImage = e.target.result;
        this.errorMessage = '';
        this.imageSelected.emit(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.patientForm.profileImage = null;
  }

  validateForm(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    // Basic validation
    if (!this.patientForm.firstName?.trim()) {
      this.errorMessage = 'First Name is required';
      return false;
    }

    if (!this.patientForm.lastName?.trim()) {
      this.errorMessage = 'Last Name is required';
      return false;
    }

    return true;
  }

  onSubmit() {
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