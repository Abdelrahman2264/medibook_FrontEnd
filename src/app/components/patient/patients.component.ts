// patients.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientsService } from '../../services/patients.service';
import { RoleService } from '../../services/role.service';
import { Patient, UpdatePatientDto } from '../../models/patient.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { PatientFormModalComponent } from '../Shared/patient-form-modal/patient-form-modal.component';
import { BaseRoleAwareComponent } from '../../shared/base-role-aware.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, PatientFormModalComponent]
})
export class Patients extends BaseRoleAwareComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';

  patients: Patient[] = [];
  statuses: string[] = ['Active', 'Inactive'];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showPatientModal: boolean = false;
  isEditMode: boolean = false;
  selectedPatient: Patient | null = null;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};
  
  // Role-based access
  canManage: boolean = false;
  canAdd: boolean = false;

  constructor(
    private patientsService: PatientsService,
    roleService: RoleService,
    cdr: ChangeDetectorRef
  ) {
    super(roleService, cdr);
  }

  override ngOnInit() {
    console.log('🔄 PatientsComponent initialized');
    // Wait for role to load before loading patients
    super.ngOnInit();
    
    // Debug: Check API response structure
    this.debugApiResponse();
  }

  /**
   * Called after role is loaded
   */
  protected override onRoleLoaded(role: string): void {
    console.log('🔄 Role loaded, setting permissions for patients list');
    this.canManage = this.roleService.canManagePatients();
    this.canAdd = !this.roleService.isUser();
    this.loadPatients();
  }

  // Debug method to check API response
  debugApiResponse() {
    this.patientsService.debugPatientApiResponse().subscribe({
      next: (response) => {
        console.log('🐛 DEBUG - RAW PATIENTS API RESPONSE:', response);
        if (response && response.length > 0) {
          console.log('🐛 DEBUG - First patient raw data:', response[0]);
          console.log('🐛 DEBUG - All properties of first patient:', Object.keys(response[0]));
          console.log('🐛 DEBUG - First patient id value:', response[0].id, response[0].Id);
        }
      },
      error: (error) => {
        console.error('🐛 DEBUG - PATIENTS API error:', error);
      }
    });
  }

  // Force update method
  protected override forceUpdate() {
    this.cdr.detectChanges();
  }

  loadPatients() {
    console.log('🔄 Loading patients...');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Force update to show loading state
    this.forceUpdate();

    this.patientsService.getAllPatients().subscribe({
      next: (data: Patient[]) => {
        console.log('📋 Patients loaded:', data);
        // Validate that all patients have valid IDs
        const invalidPatients = data.filter(p => !p.id || p.id === 0);
        if (invalidPatients.length > 0) {
          console.error('❌ Found patients with invalid IDs:', invalidPatients);
          console.error('❌ First invalid patient raw data:', invalidPatients[0]);
        }
        this.patients = data;
        this.isLoading = false;
        
        // Force update after data is loaded
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading patients:', error);
        this.errorMessage = 'Failed to load patients. Please try again.';
        this.isLoading = false;
        
        // Force update after error
        this.forceUpdate();
      }
    });
  }

  // Modal functions
  openEditModal(patient: Patient) {
    console.log('📝 Opening edit modal for:', {
      fullName: patient.fullName,
      id: patient.id,
      fullPatient: patient
    });
    
    // Ensure we have the patient data before opening modal
    if (!patient) {
      console.error('❌ Cannot open edit modal: patient is null');
      return;
    }
    
    // Validate id before opening modal
    if (!patient.id || patient.id === 0) {
      console.error('❌ ERROR: Cannot open edit modal - patient id is invalid:', patient);
      alert('Error: Invalid patient ID. Cannot edit this patient.');
      return;
    }
    
    // Set edit mode and selected patient first
    this.isEditMode = true;
    this.selectedPatient = patient;
    
    // Force update to ensure selectedPatient is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showPatientModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with patient data:', {
        id: this.selectedPatient?.id,
        fullName: this.selectedPatient?.fullName
      });
    }, 50);
  }

  closeModal() {
    console.log('❌ Closing modal');
    this.showPatientModal = false;
    this.selectedPatient = null;
    this.forceUpdate();
  }

  onSavePatient(patientData: UpdatePatientDto) {
    console.log('💾 Saving patient data:', patientData);
    
    if (!this.selectedPatient) {
      console.error('❌ Cannot save: no patient selected');
      return;
    }

    this.isLoading = true;
    this.forceUpdate();

    // Validate patient id before update
    if (!this.selectedPatient.id || this.selectedPatient.id === 0) {
      console.error('❌ ERROR: Cannot update - patient id is invalid:', this.selectedPatient);
      alert('Error: Invalid patient ID. Cannot update this patient.');
      this.isLoading = false;
      this.forceUpdate();
      return;
    }
    
    console.log('💾 Updating patient:', {
      id: this.selectedPatient.id,
      updateData: patientData
    });
    
    // Update patient
    this.patientsService.updatePatient(this.selectedPatient.id, patientData).subscribe({
      next: (response: any) => {
        console.log('✅ Patient updated successfully');
        this.loadPatients(); // This will refresh the list and force update
        this.closeModal();
      },
      error: (error: any) => {
        console.error('❌ Error updating patient:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update patient. Please try again.');
      }
    });
  }

  // Filtering and Sorting
  filteredPatients(): Patient[] {
    const filtered = this.patients
      .filter(p => 
        p.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.mobilePhone?.includes(this.searchTerm)
      )
      .filter(p => !this.selectedStatus || p.state === this.selectedStatus);
    
    console.log('🔍 Filtered patients:', filtered.length);
    return filtered;
  }

  sortByName() {
    console.log('🔤 Sorting patients by name');
    this.patients.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.forceUpdate();
  }

  sortByStatus() {
    console.log('🔤 Sorting patients by status');
    this.patients.sort((a, b) => a.state.localeCompare(b.state));
    this.forceUpdate();
  }

  // Activation/Deactivation
  toggleActive(patient: Patient) {
    const newActiveState = !patient.isActive;
    
    console.log('🔄 Toggling active state for:', patient.fullName, 'New state:', newActiveState);

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Patient`,
      message: `Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} <strong>${patient.fullName}</strong>?`,
      icon: newActiveState ? 'fas fa-user-check' : 'fas fa-user-slash',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(patient, newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(patient: Patient, newActiveState: boolean) {
    console.log('🚀 Executing toggle active for:', patient.fullName);
    
    const apiCall$ = newActiveState 
      ? this.patientsService.activateUser(patient.id)
      : this.patientsService.deactivateUser(patient.id);

    this.isLoading = true;
    this.forceUpdate();

    apiCall$.subscribe({
      next: (response: any) => {
        console.log('✅ Toggle active successful');
        this.loadPatients(); // Refresh the list
      },
      error: (error: any) => {
        console.error('❌ Toggle active failed:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update patient status. Please try again.');
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

  // Stats and Utilities
  countActive(): number {
    const count = this.patients.filter(p => p.isActive).length;
    console.log('📊 Active patients count:', count);
    return count;
  }

  countInactive(): number {
    const count = this.patients.filter(p => !p.isActive).length;
    console.log('📊 Inactive patients count:', count);
    return count;
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedStatus = '';
    this.forceUpdate();
  }

  // Get status badge class
  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  }

  // Get gender icon
  getGenderIcon(gender: string): string {
    return gender === 'Female' ? 'fas fa-venus' : 'fas fa-mars';
  }
}