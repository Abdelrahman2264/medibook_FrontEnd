// doctor-profile.component.ts - ENHANCED VERSION
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { RoleService } from '../../services/role.service';
import { Doctor, UpdateDoctorDto } from '../../models/doctor.model';
import { DoctorFormModalComponent } from '../Shared/doctor-form-modal/doctor-form-modal.component';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { BaseRoleAwareComponent } from '../../shared/base-role-aware.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, DoctorFormModalComponent]
})
export class DoctorProfileComponent extends BaseRoleAwareComponent implements OnInit {
  doctor: Doctor | null = null;
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
  canAssignAppointment: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsService: DoctorsService,
    roleService: RoleService,
    cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    super(roleService, cdr);
  }

  override ngOnInit() {
    console.log('🔄 DoctorProfileComponent initialized');
    // Wait for role to load before setting permissions
    super.ngOnInit();
  }

  /**
   * Called after role is loaded
   */
  protected override onRoleLoaded(role: string): void {
    console.log('🔄 Role loaded, setting permissions for doctor profile');
    // Doctors can only view other doctors, not manage them
    // Nurses can only view doctors, not manage them
    this.canManage = this.roleService.canManageDoctors();
    this.canAssignAppointment = this.roleService.isDoctor();
    this.loadDoctor();
  }

  // Force update method
  protected override forceUpdate() {
    console.log('🔄 Force updating doctor profile...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadDoctor() {
    console.log('🔄 Loading doctor profile...');
    this.isLoading = true;
    this.errorMessage = '';
    this.doctor = null;
    
    // Force update to show loading state immediately
    this.forceUpdate();

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && !isNaN(Number(id))) {
      console.log('📋 Fetching doctor with ID:', id);
      
      this.doctorsService.getDoctorById(Number(id)).subscribe({
        next: (doctor: Doctor) => {
          console.log('✅ Doctor data received:', doctor);
          this.doctor = doctor;
          this.isLoading = false;
          this.errorMessage = '';
          
          // Force update after data is set
          this.forceUpdate();
          console.log('✅ Profile loaded successfully');
        },
        error: (error: any) => {
          console.error('❌ Error loading doctor:', error);
          this.isLoading = false;
          this.doctor = null;
          this.errorMessage = this.getErrorMessage(error);
          
          // Force update after error
          this.forceUpdate();
        }
      });
    } else {
      console.error('❌ Invalid doctor ID:', id);
      this.errorMessage = 'Invalid doctor ID provided.';
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Doctor not found. The requested profile does not exist.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An unexpected error occurred while loading the doctor profile.';
    }
  }


  // Activation/Deactivation
  toggleActive() {
    if (!this.doctor) return;

    const newActiveState = !this.doctor.isActive;
    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🔄 Toggling active state:', {
      doctor: this.doctor.fullName,
      currentState: this.doctor.isActive,
      newState: newActiveState
    });

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Doctor`,
      message: `Are you sure you want to ${action} <strong>${this.doctor.fullName}</strong>?`,
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
    if (!this.doctor) return;

    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🚀 Executing toggle active:', {
      userId: this.doctor.userId,
      action: action
    });

    this.isLoading = true;
    this.forceUpdate();

    const apiCall$ = newActiveState 
      ? this.doctorsService.activateUser(this.doctor.userId)
      : this.doctorsService.deactivateUser(this.doctor.userId);

    apiCall$.subscribe({
      next: (response: any) => {
        console.log(`✅ ${action} successful`);
        this.loadDoctor(); // Reload to get fresh data
      },
      error: (error: any) => {
        console.error(`❌ ${action} failed:`, error);
        this.isLoading = false;
        this.forceUpdate();
        
        let errorMessage = `Failed to ${action} ${this.doctor?.fullName}. `;
        
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
        
        this.toastService.error(errorMessage);
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

  editDoctor() {
    if (!this.doctor) {
      console.error('❌ Cannot open edit modal: doctor is null');
      return;
    }
    
    console.log('✏️ Opening edit modal for:', this.doctor.fullName);
    
    // Ensure doctor data is loaded before opening modal
    if (this.isLoading) {
      console.warn('⚠️ Doctor data is still loading, waiting...');
      // Wait for data to load
      const checkInterval = setInterval(() => {
        if (!this.isLoading && this.doctor) {
          clearInterval(checkInterval);
          this.showEditModal = true;
          this.forceUpdate();
          console.log('✅ Modal opened after data loaded');
        }
      }, 100);
      return;
    }
    
    // Force update to ensure doctor is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showEditModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with doctor data:', {
        doctorId: this.doctor?.doctorId,
        fullName: this.doctor?.fullName
      });
    }, 50);
  }

  closeEditModal() {
    console.log('❌ Closing edit modal');
    this.showEditModal = false;
    this.forceUpdate();
  }

  onSaveDoctor(doctorData: UpdateDoctorDto) {
    if (!this.doctor) return;

    console.log('💾 Saving doctor updates');
    this.isLoading = true;
    this.forceUpdate();

    this.doctorsService.updateDoctor(this.doctor.doctorId, doctorData).subscribe({
      next: (response: any) => {
        console.log('✅ Doctor updated successfully');
        this.loadDoctor(); // Reload to get updated data
        this.closeEditModal();
      },
      error: (error: any) => {
        console.error('❌ Error updating doctor:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to update doctor. Please try again.');
      }
    });
  }

  goBack() {
    console.log('↩️ Going back to doctors list');
    this.router.navigate(['/doctors']);
  }

  retryLoad() {
    console.log('🔄 Retrying load...');
    this.loadDoctor();
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

  getExperienceLevel(): string {
    if (!this.doctor) return '';
    
    const years = this.doctor.experienceYears;
    if (years <= 2) return 'Junior';
    if (years <= 5) return 'Mid-level';
    if (years <= 10) return 'Senior';
    return 'Expert';
  }

  getStatusBadgeClass(): string {
    if (!this.doctor) return '';
    
    return this.doctor.isActive ? 'status-badge active' : 'status-badge inactive';
  }

  // Debug method
  debugState() {
    console.log('🔍 Current Doctor Profile State:', {
      isLoading: this.isLoading,
      doctor: this.doctor,
      errorMessage: this.errorMessage,
      showEditModal: this.showEditModal,
      showConfirmationModal: this.showConfirmationModal
    });
    this.forceUpdate();
  }

  // Doctor-specific action: Assign appointment
  assignAppointment() {
    if (!this.doctor) {
      console.error('❌ Cannot assign appointment: doctor is null');
      return;
    }

    console.log('🔄 Doctor assigning appointment for:', this.doctor.fullName);
    // Navigate to assign-appointment page
    this.router.navigate(['/assign-appointment', this.doctor.doctorId]);
  }
}