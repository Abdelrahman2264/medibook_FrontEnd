// patient-profile.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { RoleService } from '../../services/role.service';
import { Patient, UpdatePatientDto } from '../../models/patient.model';
import { PatientFormModalComponent } from '../Shared/patient-form-modal/patient-form-modal.component';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { BaseRoleAwareComponent } from '../../shared/base-role-aware.component';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, PatientFormModalComponent]
})
export class PatientProfile extends BaseRoleAwareComponent implements OnInit {
  patient: Patient | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Modal states
  showEditModal: boolean = false;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  // Role-based access
  canManage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientsService: PatientsService,
    roleService: RoleService,
    cdr: ChangeDetectorRef
  ) {
    super(roleService, cdr);
  }

  override ngOnInit() {
    console.log('🔄 PatientProfileComponent initialized');
    // Wait for role to load before setting canManage and loading patient
    super.ngOnInit();
  }

  /**
   * Called after role is loaded
   */
  protected override onRoleLoaded(role: string): void {
    console.log('🔄 Role loaded, setting canManage for patient profile');
    this.canManage = this.roleService.canManagePatients();
    this.loadPatient();
  }

  // Force update method
  protected override forceUpdate() {
    console.log('🔄 Force updating patient profile...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadPatient() {
    console.log('🔄 Loading patient profile...');
    this.isLoading = true;
    this.errorMessage = '';
    this.patient = null;
    
    // Force update to show loading state immediately
    this.forceUpdate();

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && !isNaN(Number(id))) {
      const numericId = Number(id);
      console.log('📋 Fetching patient with ID:', numericId);
      
      this.patientsService.getPatientById(numericId).subscribe({
        next: (patient: Patient) => {
          console.log('✅ Patient data received:', {
            id: patient.id,
            fullName: patient.fullName,
            fullPatient: patient
          });
          
          if (!patient.id || patient.id === 0) {
            console.error('❌ ERROR: Received patient with invalid ID:', patient);
            this.errorMessage = 'Error: Received invalid patient data from server.';
            this.isLoading = false;
            this.patient = null;
            this.forceUpdate();
            return;
          }
          
          this.patient = patient;
          this.isLoading = false;
          this.errorMessage = '';
          
          // Force update after data is set
          this.forceUpdate();
          console.log('✅ Profile loaded successfully');
        },
        error: (error: any) => {
          console.error('❌ Error loading patient:', error);
          this.isLoading = false;
          this.patient = null;
          this.errorMessage = this.getErrorMessage(error);
          
          // Force update after error
          this.forceUpdate();
        }
      });
    } else {
      console.error('❌ Invalid patient ID:', id);
      this.errorMessage = 'Invalid patient ID provided.';
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Patient not found. The requested profile does not exist.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An unexpected error occurred while loading the patient profile.';
    }
  }

  // Edit modal functions
  editPatient() {
    if (!this.patient) {
      console.error('❌ Cannot open edit modal: patient is null');
      return;
    }
    
    console.log('✏️ Opening edit modal for:', this.patient.fullName);
    
    // Ensure patient data is loaded before opening modal
    if (this.isLoading) {
      console.warn('⚠️ Patient data is still loading, waiting...');
      // Wait for data to load
      const checkInterval = setInterval(() => {
        if (!this.isLoading && this.patient) {
          clearInterval(checkInterval);
          this.showEditModal = true;
          this.forceUpdate();
          console.log('✅ Modal opened after data loaded');
        }
      }, 100);
      return;
    }
    
    // Force update to ensure patient is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showEditModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with patient data:', {
        id: this.patient?.id,
        fullName: this.patient?.fullName
      });
    }, 50);
  }

  closeEditModal() {
    console.log('❌ Closing edit modal');
    this.showEditModal = false;
    this.forceUpdate();
  }

  onSavePatient(patientData: UpdatePatientDto) {
    if (!this.patient) {
      console.error('❌ Cannot save: patient is null');
      return;
    }

    // Validate patient id before update
    if (!this.patient.id || this.patient.id === 0) {
      console.error('❌ ERROR: Cannot update - patient id is invalid:', this.patient);
      alert('Error: Invalid patient ID. Cannot update this patient.');
      return;
    }

    console.log('💾 Saving patient updates:', {
      id: this.patient.id,
      updateData: patientData
    });
    
    this.isLoading = true;
    this.forceUpdate();

    this.patientsService.updatePatient(this.patient.id, patientData).subscribe({
      next: (response: any) => {
        console.log('✅ Patient updated successfully');
        this.loadPatient(); // Reload to get updated data
        this.closeEditModal();
      },
      error: (error: any) => {
        console.error('❌ Error updating patient:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update patient. Please try again.');
      }
    });
  }

  // Activation/Deactivation
  toggleActive() {
    if (!this.patient) return;

    const newActiveState = !this.patient.isActive;
    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🔄 Toggling active state:', {
      patient: this.patient.fullName,
      currentState: this.patient.isActive,
      newState: newActiveState
    });

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Patient`,
      message: `Are you sure you want to ${action} <strong>${this.patient.fullName}</strong>?`,
      icon: newActiveState ? 'fas fa-user-check' : 'fas fa-user-slash',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(newActiveState: boolean) {
    if (!this.patient) return;

    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🚀 Executing toggle active:', {
      id: this.patient.id,
      action: action
    });

    this.isLoading = true;
    this.forceUpdate();

    const apiCall$ = newActiveState 
      ? this.patientsService.activateUser(this.patient.id)
      : this.patientsService.deactivateUser(this.patient.id);

    apiCall$.subscribe({
      next: (response: any) => {
        console.log(`✅ ${action} successful`);
        this.loadPatient(); // Reload to get fresh data
      },
      error: (error: any) => {
        console.error(`❌ ${action} failed:`, error);
        this.isLoading = false;
        this.forceUpdate();
        
        let errorMessage = `Failed to ${action} ${this.patient?.fullName}. `;
        
        if (error.status === 0) {
          errorMessage += 'Network error: Cannot connect to server.';
        } else if (error.status === 404) {
          errorMessage += 'Endpoint not found.';
        } else if (error.status === 405) {
          errorMessage += 'Method not allowed.';
        } else if (error.status === 401) {
          errorMessage += 'Unauthorized.';
        } else {
          errorMessage += 'Please try again.';
        }
        
        alert(errorMessage);
      }
    });
  }

  // Confirmation modal handlers
  onConfirmAction() {
    console.log('✅ Confirmation confirmed');
    this.showConfirmationModal = false;
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.forceUpdate();
  }

  onCancelAction() {
    console.log('❌ Confirmation cancelled');
    this.showConfirmationModal = false;
    this.pendingAction = () => {};
    this.forceUpdate();
  }

  goBack() {
    console.log('↩️ Going back to patients list');
    this.router.navigate(['/patients']);
  }

  retryLoad() {
    console.log('🔄 Retrying load...');
    this.loadPatient();
  }

  // Helper methods for template
  getGenderIcon(gender: string): string {
    return gender === 'Female' ? 'fas fa-venus' : 'fas fa-mars';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  }
}