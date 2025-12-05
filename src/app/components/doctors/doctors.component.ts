// doctors.component.ts - ENHANCED VERSION
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { RoleService } from '../../services/role.service';
import { Doctor, CreateDoctorDto, UpdateDoctorDto } from '../../models/doctor.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { DoctorFormModalComponent } from '../Shared/doctor-form-modal/doctor-form-modal.component';
import { BaseRoleAwareComponent } from '../../shared/base-role-aware.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, DoctorFormModalComponent]
})
export class DoctorsComponent extends BaseRoleAwareComponent implements OnInit {
  searchTerm: string = '';
  selectedSpecialty: string = '';
  selectedState: string = '';

  doctors: Doctor[] = [];
  specialties: string[] = [];
  states: string[] = ['Active', 'Inactive'];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showDoctorModal: boolean = false;
  isEditMode: boolean = false;
  selectedDoctor: Doctor | null = null;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  // Role-based access
  canManage: boolean = false;

  constructor(
    private doctorsService: DoctorsService,
    roleService: RoleService,
    cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    super(roleService, cdr);
  }

  override ngOnInit() {
    console.log('🔄 DoctorsComponent initialized');
    // Wait for role to load before setting canManage
    super.ngOnInit();
  }

  /**
   * Called after role is loaded
   */
  protected override onRoleLoaded(role: string): void {
    console.log('🔄 Role loaded, setting permissions for doctors list');
    this.canManage = this.roleService.canManageDoctors();
    this.loadDoctors();
  }

  // Force update method
  protected override forceUpdate() {
    console.log('🔄 Force updating component...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadDoctors() {
    console.log('🔄 Loading doctors...');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Force update to show loading state
    this.forceUpdate();

    this.doctorsService.getAllDoctors().subscribe({
      next: (data: Doctor[]) => {
        console.log('✅ Doctors loaded:', data.length);
        this.doctors = data;
        this.specialties = [...new Set(this.doctors.map(d => d.specialization).filter(Boolean))];
        this.isLoading = false;
        
        // Force update after data is loaded
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading doctors:', error);
        this.errorMessage = 'Failed to load doctors. Please try again.';
        this.isLoading = false;
        
        // Force update after error
        this.forceUpdate();
      }
    });
  }

  // Modal functions - ENHANCED
  openCreateModal() {
    console.log('📝 Opening create modal');
    this.isEditMode = false;
    this.selectedDoctor = null;
    this.showDoctorModal = true;
    
    // Small delay to ensure modal component is initialized
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openEditModal(doctor: Doctor) {
    console.log('📝 Opening edit modal for:', doctor.fullName);
    
    // Ensure we have the doctor data before opening modal
    if (!doctor) {
      console.error('❌ Cannot open edit modal: doctor is null');
      return;
    }
    
    // Set edit mode and selected doctor first
    this.isEditMode = true;
    this.selectedDoctor = doctor;
    
    // Force update to ensure selectedDoctor is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showDoctorModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with doctor data:', {
        doctorId: this.selectedDoctor?.doctorId,
        fullName: this.selectedDoctor?.fullName
      });
    }, 50);
  }

  closeModal() {
    console.log('❌ Closing modal');
    this.showDoctorModal = false;
    this.selectedDoctor = null;
    this.forceUpdate();
  }

  onSaveDoctor(doctorData: CreateDoctorDto | UpdateDoctorDto) {
    console.log('💾 Saving doctor data:', { 
      ...doctorData, 
      password: 'password' in doctorData && doctorData.password ? '[REDACTED]' : 'No Password' 
    });
    
    this.isLoading = true;
    this.forceUpdate();

    if (this.isEditMode && this.selectedDoctor) {
      // Update doctor - doctorData is UpdateDoctorDto
      this.doctorsService.updateDoctor(this.selectedDoctor.doctorId, doctorData as UpdateDoctorDto).subscribe({
        next: (response: any) => {
          console.log('✅ Doctor updated successfully');
          this.loadDoctors(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error updating doctor:', error);
          this.isLoading = false;
          this.forceUpdate();
          this.toastService.error('Failed to update doctor. Please try again.');
        }
      });
    } else {
      // Create doctor - doctorData is CreateDoctorDto
      this.doctorsService.createDoctor(doctorData as CreateDoctorDto).subscribe({
        next: (response: any) => {
          console.log('✅ Doctor created successfully');
          this.loadDoctors(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error creating doctor:', error);
          this.isLoading = false;
          this.forceUpdate();
          this.toastService.error('Failed to create doctor. Please try again.');
        }
      });
    }
  }

  // UI Helper Methods
  getSpecialtyIcon(specialization: string): string {
    switch (specialization?.toLowerCase()) {
      case 'cardiology': return 'fas fa-heartbeat';
      case 'neurology': return 'fas fa-brain';
      case 'pediatrics': return 'fas fa-baby';
      case 'dentistry': return 'fas fa-tooth';
      case 'orthopedics': return 'fas fa-bone';
      case 'dermatology': return 'fas fa-allergies';
      default: return 'fas fa-user-md';
    }
  }

  getCardColor(specialization: string, index: number): string {
    return index % 2 === 0 ? '#e6ccff' : '#f2f2f2'; 
  }

  filteredDoctors(): Doctor[] {
    const filtered = this.doctors
      .filter(d => d.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(d => !this.selectedSpecialty || d.specialization === this.selectedSpecialty)
      .filter(d => !this.selectedState || d.state === this.selectedState);
    
    console.log('🔍 Filtered doctors:', filtered.length);
    return filtered;
  }

  sortByName() {
    console.log('🔤 Sorting doctors by name');
    this.doctors.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.forceUpdate();
  }

  // Activation/Deactivation
  toggleActive(doctor: Doctor) {
    const newActiveState = !doctor.isActive;
    
    console.log('🔄 Toggling active state for:', doctor.fullName, 'New state:', newActiveState);

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Doctor`,
      message: `Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} <strong>${doctor.fullName}</strong>?`,
      icon: newActiveState ? 'fas fa-user-check' : 'fas fa-user-slash',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(doctor, newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(doctor: Doctor, newActiveState: boolean) {
    console.log('🚀 Executing toggle active for:', doctor.fullName);
    
    const apiCall$ = newActiveState 
      ? this.doctorsService.activateUser(doctor.userId)
      : this.doctorsService.deactivateUser(doctor.userId);

    this.isLoading = true;
    this.forceUpdate();

    apiCall$.subscribe({
      next: (response: any) => {
        console.log('✅ Toggle active successful');
        this.loadDoctors(); // Refresh the list
      },
      error: (error: any) => {
        console.error('❌ Toggle active failed:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to update doctor status. Please try again.');
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
    const count = this.doctors.filter(n => n.isActive).length;
    console.log('📊 Active doctors count:', count);
    return count;
  }

  countInactive(): number {
    const count = this.doctors.filter(n => !n.isActive).length;
    console.log('📊 Inactive doctors count:', count);
    return count;
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedSpecialty = '';
    this.selectedState = '';
    this.forceUpdate();
  }

  // Debug method
  debugState() {
    console.log('🔍 Current Doctors Component State:', {
      isLoading: this.isLoading,
      doctorsCount: this.doctors.length,
      filteredCount: this.filteredDoctors().length,
      showDoctorModal: this.showDoctorModal,
      showConfirmationModal: this.showConfirmationModal,
      searchTerm: this.searchTerm,
      selectedSpecialty: this.selectedSpecialty,
      selectedState: this.selectedState
    });
    this.forceUpdate();
  }
}