// nurse-profile.component.ts - ENHANCED VERSION
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NursesService } from '../../services/nurses.service';
import { Nurse, UpdateNurseDto } from '../../models/nurse.model';
import { NurseFormModalComponent } from '../Shared/nurse-form-modal/nurse-form-modal.component';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-nurse-profile',
  templateUrl: './nurse-profile.component.html',
  styleUrls: ['./nurse-profile.component.css'],
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, NurseFormModalComponent]
})
export class NurseProfile implements OnInit {
  nurse: Nurse | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Modal states
  showEditModal: boolean = false;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nursesService: NursesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 NurseProfileComponent initialized');
    this.loadNurse();
  }

  // Force update method
  forceUpdate() {
    console.log('🔄 Force updating nurse profile...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadNurse() {
    console.log('🔄 Loading nurse profile...');
    this.isLoading = true;
    this.errorMessage = '';
    this.nurse = null;
    
    // Force update to show loading state immediately
    this.forceUpdate();

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && !isNaN(Number(id))) {
      const numericId = Number(id);
      console.log('📋 Fetching nurse with ID:', numericId);
      
      this.nursesService.getNurseById(numericId).subscribe({
        next: (nurse: Nurse) => {
          console.log('✅ Nurse data received:', {
            nurseId: nurse.nurseId,
            userId: nurse.userId,
            fullName: nurse.fullName,
            fullNurse: nurse
          });
          
          if (!nurse.nurseId || nurse.nurseId === 0) {
            console.error('❌ ERROR: Received nurse with invalid ID:', nurse);
            this.errorMessage = 'Error: Received invalid nurse data from server.';
            this.isLoading = false;
            this.nurse = null;
            this.forceUpdate();
            return;
          }
          
          this.nurse = nurse;
          this.isLoading = false;
          this.errorMessage = '';
          
          // Force update after data is set
          this.forceUpdate();
          console.log('✅ Profile loaded successfully');
        },
        error: (error: any) => {
          console.error('❌ Error loading nurse:', error);
          this.isLoading = false;
          this.nurse = null;
          this.errorMessage = this.getErrorMessage(error);
          
          // Force update after error
          this.forceUpdate();
        }
      });
    } else {
      console.error('❌ Invalid nurse ID:', id);
      this.errorMessage = 'Invalid nurse ID provided.';
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Nurse not found. The requested profile does not exist.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An unexpected error occurred while loading the nurse profile.';
    }
  }

  // Edit modal functions
  editNurse() {
    if (!this.nurse) {
      console.error('❌ Cannot open edit modal: nurse is null');
      return;
    }
    
    console.log('✏️ Opening edit modal for:', this.nurse.fullName);
    
    // Ensure nurse data is loaded before opening modal
    if (this.isLoading) {
      console.warn('⚠️ Nurse data is still loading, waiting...');
      // Wait for data to load
      const checkInterval = setInterval(() => {
        if (!this.isLoading && this.nurse) {
          clearInterval(checkInterval);
          this.showEditModal = true;
          this.forceUpdate();
          console.log('✅ Modal opened after data loaded');
        }
      }, 100);
      return;
    }
    
    // Force update to ensure nurse is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showEditModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with nurse data:', {
        nurseId: this.nurse?.nurseId,
        fullName: this.nurse?.fullName
      });
    }, 50);
  }

  closeEditModal() {
    console.log('❌ Closing edit modal');
    this.showEditModal = false;
    this.forceUpdate();
  }

  onSaveNurse(nurseData: UpdateNurseDto) {
    if (!this.nurse) {
      console.error('❌ Cannot save: nurse is null');
      return;
    }

    // Validate nurseId before update
    if (!this.nurse.nurseId || this.nurse.nurseId === 0) {
      console.error('❌ ERROR: Cannot update - nurseId is invalid:', this.nurse);
      alert('Error: Invalid nurse ID. Cannot update this nurse.');
      return;
    }

    console.log('💾 Saving nurse updates:', {
      nurseId: this.nurse.nurseId,
      updateData: nurseData
    });
    
    this.isLoading = true;
    this.forceUpdate();

    this.nursesService.updateNurse(this.nurse.nurseId, nurseData).subscribe({
      next: (response: any) => {
        console.log('✅ Nurse updated successfully');
        this.loadNurse(); // Reload to get updated data
        this.closeEditModal();
      },
      error: (error: any) => {
        console.error('❌ Error updating nurse:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update nurse. Please try again.');
      }
    });
  }

  // Activation/Deactivation
  toggleActive() {
    if (!this.nurse) return;

    const newActiveState = !this.nurse.isActive;
    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🔄 Toggling active state:', {
      nurse: this.nurse.fullName,
      currentState: this.nurse.isActive,
      newState: newActiveState
    });

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Nurse`,
      message: `Are you sure you want to ${action} <strong>${this.nurse.fullName}</strong>?`,
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
    if (!this.nurse) return;

    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🚀 Executing toggle active:', {
      userId: this.nurse.userId,
      action: action
    });

    this.isLoading = true;
    this.forceUpdate();

    const apiCall$ = newActiveState 
      ? this.nursesService.activateUser(this.nurse.userId)
      : this.nursesService.deactivateUser(this.nurse.userId);

    apiCall$.subscribe({
      next: (response: any) => {
        console.log(`✅ ${action} successful`);
        this.loadNurse(); // Reload to get fresh data
      },
      error: (error: any) => {
        console.error(`❌ ${action} failed:`, error);
        this.isLoading = false;
        this.forceUpdate();
        
        let errorMessage = `Failed to ${action} ${this.nurse?.fullName}. `;
        
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
    console.log('↩️ Going back to nurses list');
    this.router.navigate(['/nurses']);
  }

  retryLoad() {
    console.log('🔄 Retrying load...');
    this.loadNurse();
  }
}