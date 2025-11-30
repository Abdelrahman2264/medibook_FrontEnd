// nurses.component.ts - ENHANCED VERSION
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NursesService } from '../../services/nurses.service';
import { Nurse, CreateNurseDto, UpdateNurseDto } from '../../models/nurse.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { NurseFormModalComponent } from '../Shared/nurse-form-modal/nurse-form-modal.component';

@Component({
  selector: 'app-nurses',
  standalone: true,
  templateUrl: './nurses.component.html',
  styleUrls: ['./nurses.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, NurseFormModalComponent]
})
export class Nurses implements OnInit {
  searchTerm: string = '';
  selectedState: string = '';

  nurses: Nurse[] = [];
  states: string[] = ['Active', 'Inactive'];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showNurseModal: boolean = false;
  isEditMode: boolean = false;
  selectedNurse: Nurse | null = null;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private nursesService: NursesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 NursesComponent initialized');
    this.loadNurses();
    
    // Debug: Check API response structure
    this.debugApiResponse();
  }

  // Debug method to check API response
  debugApiResponse() {
    this.nursesService.debugNurseApiResponse().subscribe({
      next: (response) => {
        console.log('🐛 DEBUG - RAW API RESPONSE:', response);
        if (response && response.length > 0) {
          console.log('🐛 DEBUG - First nurse raw data:', response[0]);
          console.log('🐛 DEBUG - All properties of first nurse:', Object.keys(response[0]));
          console.log('🐛 DEBUG - First nurse nurseId value:', response[0].nurseId, response[0].NurseId);
        }
      },
      error: (error) => {
        console.error('🐛 DEBUG - API error:', error);
      }
    });
  }

  // Force update method
  forceUpdate() {
    console.log('🔄 Force updating component...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadNurses() {
    console.log('🔄 Loading nurses...');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Force update to show loading state
    this.forceUpdate();

    this.nursesService.getAllNurses().subscribe({
      next: (data: Nurse[]) => {
        console.log('📋 Nurses loaded:', data);
        // Validate that all nurses have valid IDs
        const invalidNurses = data.filter(n => !n.nurseId || n.nurseId === 0);
        if (invalidNurses.length > 0) {
          console.error('❌ Found nurses with invalid IDs:', invalidNurses);
          console.error('❌ First invalid nurse raw data:', invalidNurses[0]);
        }
        this.nurses = data;
        this.isLoading = false;
        
        // Force update after data is loaded
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading nurses:', error);
        this.errorMessage = 'Failed to load nurses. Please try again.';
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
    this.selectedNurse = null;
    this.showNurseModal = true;
    
    // Small delay to ensure modal component is initialized
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openEditModal(nurse: Nurse) {
    console.log('📝 Opening edit modal for:', {
      fullName: nurse.fullName,
      nurseId: nurse.nurseId,
      userId: nurse.userId,
      fullNurse: nurse
    });
    
    // Ensure we have the nurse data before opening modal
    if (!nurse) {
      console.error('❌ Cannot open edit modal: nurse is null');
      return;
    }
    
    // Validate nurseId before opening modal
    if (!nurse.nurseId || nurse.nurseId === 0) {
      console.error('❌ ERROR: Cannot open edit modal - nurseId is invalid:', nurse);
      alert('Error: Invalid nurse ID. Cannot edit this nurse.');
      return;
    }
    
    // Set edit mode and selected nurse first
    this.isEditMode = true;
    this.selectedNurse = nurse;
    
    // Force update to ensure selectedNurse is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showNurseModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with nurse data:', {
        nurseId: this.selectedNurse?.nurseId,
        fullName: this.selectedNurse?.fullName
      });
    }, 50);
  }

  closeModal() {
    console.log('❌ Closing modal');
    this.showNurseModal = false;
    this.selectedNurse = null;
    this.forceUpdate();
  }

  onSaveNurse(nurseData: CreateNurseDto | UpdateNurseDto) {
    console.log('💾 Saving nurse data:', { 
      ...nurseData, 
      password: 'password' in nurseData && nurseData.password ? '[REDACTED]' : 'No Password' 
    });
    
    this.isLoading = true;
    this.forceUpdate();

    if (this.isEditMode && this.selectedNurse) {
      // Validate nurseId before update
      if (!this.selectedNurse.nurseId || this.selectedNurse.nurseId === 0) {
        console.error('❌ ERROR: Cannot update - nurseId is invalid:', this.selectedNurse);
        alert('Error: Invalid nurse ID. Cannot update this nurse.');
        this.isLoading = false;
        this.forceUpdate();
        return;
      }
      
      console.log('💾 Updating nurse:', {
        nurseId: this.selectedNurse.nurseId,
        updateData: nurseData
      });
      
      // Update nurse - nurseData is UpdateNurseDto
      this.nursesService.updateNurse(this.selectedNurse.nurseId, nurseData as UpdateNurseDto).subscribe({
        next: (response: any) => {
          console.log('✅ Nurse updated successfully');
          this.loadNurses(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error updating nurse:', error);
          this.isLoading = false;
          this.forceUpdate();
          alert('Failed to update nurse. Please try again.');
        }
      });
    } else {
      // Create nurse - nurseData is CreateNurseDto
      this.nursesService.createNurse(nurseData as CreateNurseDto).subscribe({
        next: (response: any) => {
          console.log('✅ Nurse created successfully:', response);
          this.loadNurses(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error creating nurse:', error);
          this.isLoading = false;
          this.forceUpdate();
          
          // Extract error message
          let errorMessage = 'Failed to create nurse. ';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage += error.error;
            } else if (error.error.message) {
              errorMessage += error.error.message;
            } else if (error.error.errors) {
              // Handle validation errors
              const validationErrors = Object.values(error.error.errors).flat();
              errorMessage += validationErrors.join(', ');
            }
          } else if (error.message) {
            errorMessage += error.message;
          } else {
            errorMessage += 'Please check the console for details.';
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  // UI Helper Methods
  getCardColor(index: number): string {
    return index % 2 === 0 ? '#e6ccff' : '#f2f2f2'; 
  }

  filteredNurses(): Nurse[] {
    const filtered = this.nurses
      .filter(n => n.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(n => !this.selectedState || n.state === this.selectedState);
    
    console.log('🔍 Filtered nurses:', filtered.length);
    return filtered;
  }

  sortByName() {
    console.log('🔤 Sorting nurses by name');
    this.nurses.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.forceUpdate();
  }

  // Activation/Deactivation
  toggleActive(nurse: Nurse) {
    const newActiveState = !nurse.isActive;
    
    console.log('🔄 Toggling active state for:', nurse.fullName, 'New state:', newActiveState);

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Nurse`,
      message: `Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} <strong>${nurse.fullName}</strong>?`,
      icon: newActiveState ? 'fas fa-user-check' : 'fas fa-user-slash',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(nurse, newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(nurse: Nurse, newActiveState: boolean) {
    console.log('🚀 Executing toggle active for:', nurse.fullName);
    
    const apiCall$ = newActiveState 
      ? this.nursesService.activateUser(nurse.userId)
      : this.nursesService.deactivateUser(nurse.userId);

    this.isLoading = true;
    this.forceUpdate();

    apiCall$.subscribe({
      next: (response: any) => {
        console.log('✅ Toggle active successful');
        this.loadNurses(); // Refresh the list
      },
      error: (error: any) => {
        console.error('❌ Toggle active failed:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update nurse status. Please try again.');
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
    const count = this.nurses.filter(n => n.isActive).length;
    console.log('📊 Active nurses count:', count);
    return count;
  }

  countInactive(): number {
    const count = this.nurses.filter(n => !n.isActive).length;
    console.log('📊 Inactive nurses count:', count);
    return count;
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedState = '';
    this.forceUpdate();
  }
}