// admin-profile.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminsService } from '../../services/admins.service';
import { RoleService } from '../../services/role.service';
import { Admin, UpdateAdminDto } from '../../models/admin.model';
import { AdminFormModalComponent } from '../Shared/admin-form-modal/admin-form-modal.component';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { BaseRoleAwareComponent } from '../../shared/base-role-aware.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
  imports: [CommonModule, RouterModule, ConfirmationModalComponent, AdminFormModalComponent]
})
export class AdminProfile extends BaseRoleAwareComponent implements OnInit {
  admin: Admin | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Modal states
  showEditModal: boolean = false;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  // Role-based access
  canManage: boolean = false; // For activate/inactivate
  canEdit: boolean = false; // For editing admin data

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminsService: AdminsService,
    roleService: RoleService,
    cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    super(roleService, cdr);
  }

  override ngOnInit() {
    console.log('🔄 AdminProfileComponent initialized');
    // Wait for role to load before setting permissions
    super.ngOnInit();
  }

  /**
   * Called after role is loaded
   */
  protected override onRoleLoaded(role: string): void {
    console.log('🔄 Role loaded, setting permissions for admin profile');
    // Doctors and nurses can only view admins, not manage them
    // Admins can activate/inactivate other admins, but cannot edit their data
    this.canManage = this.roleService.canManageAdmins();
    this.loadAdmin();
  }

  // Force update method
  protected override forceUpdate() {
    console.log('🔄 Force updating admin profile...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadAdmin() {
    console.log('🔄 Loading admin profile...');
    this.isLoading = true;
    this.errorMessage = '';
    this.admin = null;
    
    // Force update to show loading state immediately
    this.forceUpdate();

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && !isNaN(Number(id))) {
      const numericId = Number(id);
      console.log('📋 Fetching admin with ID:', numericId);
      
      this.adminsService.getAdminById(numericId).subscribe({
        next: (admin: Admin) => {
          console.log('✅ Admin data received:', {
            id: admin.id,
            fullName: admin.fullName,
            fullAdmin: admin
          });
          
          if (!admin.id || admin.id === 0) {
            console.error('❌ ERROR: Received admin with invalid ID:', admin);
            this.errorMessage = 'Error: Received invalid admin data from server.';
            this.isLoading = false;
            this.admin = null;
            this.forceUpdate();
            return;
          }
          
          this.admin = admin;
          this.isLoading = false;
          this.errorMessage = '';
          
          // Check if current admin can edit this admin's data
          // Admins can only edit their own profile, not other admins
          this.canEdit = this.roleService.canEditAdmin(admin.id);
          
          // Force update after data is set
          this.forceUpdate();
          console.log('✅ Profile loaded successfully');
        },
        error: (error: any) => {
          console.error('❌ Error loading admin:', error);
          this.isLoading = false;
          this.admin = null;
          this.errorMessage = this.getErrorMessage(error);
          
          // Force update after error
          this.forceUpdate();
        }
      });
    } else {
      console.error('❌ Invalid admin ID:', id);
      this.errorMessage = 'Invalid admin ID provided.';
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Admin not found. The requested profile does not exist.';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return 'An unexpected error occurred while loading the admin profile.';
    }
  }

  // Edit modal functions
  editAdmin() {
    if (!this.admin) {
      console.error('❌ Cannot open edit modal: admin is null');
      return;
    }
    
    console.log('✏️ Opening edit modal for:', this.admin.fullName);
    
    // Ensure admin data is loaded before opening modal
    if (this.isLoading) {
      console.warn('⚠️ Admin data is still loading, waiting...');
      // Wait for data to load
      const checkInterval = setInterval(() => {
        if (!this.isLoading && this.admin) {
          clearInterval(checkInterval);
          this.showEditModal = true;
          this.forceUpdate();
          console.log('✅ Modal opened after data loaded');
        }
      }, 100);
      return;
    }
    
    // Force update to ensure admin is set
    this.forceUpdate();
    
    // Small delay to ensure data is set before opening modal
    setTimeout(() => {
      this.showEditModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with admin data:', {
        id: this.admin?.id,
        fullName: this.admin?.fullName
      });
    }, 50);
  }

  closeEditModal() {
    console.log('❌ Closing edit modal');
    this.showEditModal = false;
    this.forceUpdate();
  }

  onSaveAdmin(adminData: UpdateAdminDto) {
    if (!this.admin) {
      console.error('❌ Cannot save: admin is null');
      return;
    }

    // Validate admin id before update
    if (!this.admin.id || this.admin.id === 0) {
      console.error('❌ ERROR: Cannot update - admin id is invalid:', this.admin);
      this.toastService.error('Error: Invalid admin ID. Cannot update this admin.');
      return;
    }

    console.log('💾 Saving admin updates:', {
      id: this.admin.id,
      updateData: adminData
    });
    
    this.isLoading = true;
    this.forceUpdate();

    this.adminsService.updateAdmin(this.admin.id, adminData).subscribe({
      next: (response: any) => {
        console.log('✅ Admin updated successfully');
        this.loadAdmin(); // Reload to get updated data
        this.closeEditModal();
      },
      error: (error: any) => {
        console.error('❌ Error updating admin:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to update admin. Please try again.');
      }
    });
  }

  // Activation/Deactivation
  toggleActive() {
    if (!this.admin) return;

    const newActiveState = !this.admin.isActive;
    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🔄 Toggling active state:', {
      admin: this.admin.fullName,
      currentState: this.admin.isActive,
      newState: newActiveState
    });

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Admin`,
      message: `Are you sure you want to ${action} <strong>${this.admin.fullName}</strong>?`,
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
    if (!this.admin) return;

    const action = newActiveState ? 'activate' : 'deactivate';
    
    console.log('🚀 Executing toggle active:', {
      id: this.admin.id,
      action: action
    });

    this.isLoading = true;
    this.forceUpdate();

    const apiCall$ = newActiveState 
      ? this.adminsService.activateUser(this.admin.id)
      : this.adminsService.deactivateUser(this.admin.id);

    apiCall$.subscribe({
      next: (response: any) => {
        console.log(`✅ ${action} successful`);
        this.loadAdmin(); // Reload to get fresh data
      },
      error: (error: any) => {
        console.error(`❌ ${action} failed:`, error);
        this.isLoading = false;
        this.forceUpdate();
        
        let errorMessage = `Failed to ${action} ${this.admin?.fullName}. `;
        
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

  goBack() {
    console.log('↩️ Going back to admins list');
    this.router.navigate(['/admins']);
  }

  retryLoad() {
    console.log('🔄 Retrying load...');
    this.loadAdmin();
  }

  // Helper methods for template
  getGenderIcon(gender: string): string {
    return gender === 'Female' ? 'fas fa-venus' : 'fas fa-mars';
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  }
}