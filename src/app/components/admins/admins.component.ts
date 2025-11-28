// admins.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminsService } from '../../services/admins.service';
import { Admin, CreateAdminDto, UpdateAdminDto } from '../../models/admin.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { AdminFormModalComponent } from '../Shared/admin-form-modal/admin-form-modal.component';

@Component({
  selector: 'app-admins',
  standalone: true,
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, AdminFormModalComponent]
})
export class Admins implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';

  admins: Admin[] = [];
  statuses: string[] = ['Active', 'Inactive'];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showAdminModal: boolean = false;
  isEditMode: boolean = false;
  selectedAdmin: Admin | null = null;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private adminsService: AdminsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 AdminsComponent initialized');
    this.loadAdmins();
    
    // Debug: Check API response structure
    this.debugApiResponse();
  }

  // Debug method to check API response
  debugApiResponse() {
    this.adminsService.debugAdminApiResponse().subscribe({
      next: (response) => {
        console.log('🐛 DEBUG - RAW ADMINS API RESPONSE:', response);
        if (response && response.length > 0) {
          console.log('🐛 DEBUG - First admin raw data:', response[0]);
          console.log('🐛 DEBUG - All properties of first admin:', Object.keys(response[0]));
          console.log('🐛 DEBUG - First admin id value:', response[0].id, response[0].Id);
        }
      },
      error: (error) => {
        console.error('🐛 DEBUG - ADMINS API error:', error);
      }
    });
  }

  // Force update method
  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadAdmins() {
    console.log('🔄 Loading admins...');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Force update to show loading state
    this.forceUpdate();

    this.adminsService.getAllAdmins().subscribe({
      next: (data: Admin[]) => {
        console.log('📋 Admins loaded:', data);
        // Validate that all admins have valid IDs
        const invalidAdmins = data.filter(a => !a.id || a.id === 0);
        if (invalidAdmins.length > 0) {
          console.error('❌ Found admins with invalid IDs:', invalidAdmins);
          console.error('❌ First invalid admin raw data:', invalidAdmins[0]);
        }
        this.admins = data;
        this.isLoading = false;
        
        // Force update after data is loaded
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading admins:', error);
        this.errorMessage = 'Failed to load admins. Please try again.';
        this.isLoading = false;
        
        // Force update after error
        this.forceUpdate();
      }
    });
  }

  // Modal functions
  openCreateModal() {
    console.log('📝 Opening create modal');
    this.isEditMode = false;
    this.selectedAdmin = null;
    this.showAdminModal = true;
    
    // Small delay to ensure modal component is initialized
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openEditModal(admin: Admin) {
    console.log('📝 Opening edit modal for:', {
      fullName: admin.fullName,
      id: admin.id,
      fullAdmin: admin
    });
    
    // Ensure we have the admin data before opening modal
    if (!admin) {
      console.error('❌ Cannot open edit modal: admin is null');
      return;
    }
    
    // Validate id before opening modal
    if (!admin.id || admin.id === 0) {
      console.error('❌ ERROR: Cannot open edit modal - admin id is invalid:', admin);
      alert('Error: Invalid admin ID. Cannot edit this admin.');
      return;
    }
    
    // Set edit mode and selected admin first
    this.isEditMode = true;
    this.selectedAdmin = admin;
    
    // Force update to ensure selectedAdmin is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showAdminModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with admin data:', {
        id: this.selectedAdmin?.id,
        fullName: this.selectedAdmin?.fullName
      });
    }, 50);
  }

  closeModal() {
    console.log('❌ Closing modal');
    this.showAdminModal = false;
    this.selectedAdmin = null;
    this.forceUpdate();
  }

  onSaveAdmin(adminData: CreateAdminDto | UpdateAdminDto) {
    console.log('💾 Saving admin data:', { 
      ...adminData, 
      password: 'password' in adminData && adminData.password ? '[REDACTED]' : 'No Password' 
    });
    
    this.isLoading = true;
    this.forceUpdate();

    if (this.isEditMode && this.selectedAdmin) {
      // Validate admin id before update
      if (!this.selectedAdmin.id || this.selectedAdmin.id === 0) {
        console.error('❌ ERROR: Cannot update - admin id is invalid:', this.selectedAdmin);
        alert('Error: Invalid admin ID. Cannot update this admin.');
        this.isLoading = false;
        this.forceUpdate();
        return;
      }
      
      console.log('💾 Updating admin:', {
        id: this.selectedAdmin.id,
        updateData: adminData
      });
      
      // Update admin - adminData is UpdateAdminDto
      this.adminsService.updateAdmin(this.selectedAdmin.id, adminData as UpdateAdminDto).subscribe({
        next: (response: any) => {
          console.log('✅ Admin updated successfully');
          this.loadAdmins(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error updating admin:', error);
          this.isLoading = false;
          this.forceUpdate();
          alert('Failed to update admin. Please try again.');
        }
      });
    } else {
      // Create admin - adminData is CreateAdminDto
      this.adminsService.createAdmin(adminData as CreateAdminDto).subscribe({
        next: (response: any) => {
          console.log('✅ Admin created successfully');
          this.loadAdmins(); // This will refresh the list and force update
          this.closeModal();
        },
        error: (error: any) => {
          console.error('❌ Error creating admin:', error);
          this.isLoading = false;
          this.forceUpdate();
          alert('Failed to create admin. Please try again.');
        }
      });
    }
  }

  // Filtering and Sorting
  filteredAdmins(): Admin[] {
    const filtered = this.admins
      .filter(a => 
        a.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.mobilePhone?.includes(this.searchTerm)
      )
      .filter(a => !this.selectedStatus || a.state === this.selectedStatus);
    
    console.log('🔍 Filtered admins:', filtered.length);
    return filtered;
  }

  sortByName() {
    console.log('🔤 Sorting admins by name');
    this.admins.sort((a, b) => a.fullName.localeCompare(b.fullName));
    this.forceUpdate();
  }

  sortByStatus() {
    console.log('🔤 Sorting admins by status');
    this.admins.sort((a, b) => a.state.localeCompare(b.state));
    this.forceUpdate();
  }

  // Activation/Deactivation
  toggleActive(admin: Admin) {
    const newActiveState = !admin.isActive;
    
    console.log('🔄 Toggling active state for:', admin.fullName, 'New state:', newActiveState);

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Admin`,
      message: `Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} <strong>${admin.fullName}</strong>?`,
      icon: newActiveState ? 'fas fa-user-check' : 'fas fa-user-slash',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(admin, newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(admin: Admin, newActiveState: boolean) {
    console.log('🚀 Executing toggle active for:', admin.fullName);
    
    const apiCall$ = newActiveState 
      ? this.adminsService.activateUser(admin.id)
      : this.adminsService.deactivateUser(admin.id);

    this.isLoading = true;
    this.forceUpdate();

    apiCall$.subscribe({
      next: (response: any) => {
        console.log('✅ Toggle active successful');
        this.loadAdmins(); // Refresh the list
      },
      error: (error: any) => {
        console.error('❌ Toggle active failed:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update admin status. Please try again.');
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
    const count = this.admins.filter(a => a.isActive).length;
    console.log('📊 Active admins count:', count);
    return count;
  }

  countInactive(): number {
    const count = this.admins.filter(a => !a.isActive).length;
    console.log('📊 Inactive admins count:', count);
    return count;
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedStatus = '';
    this.forceUpdate();
  }

  // Get card color based on index
  getCardColor(index: number): string {
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec'];
    return colors[index % colors.length];
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