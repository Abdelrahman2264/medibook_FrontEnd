import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { PatientsService } from '../../services/patients.service';
import { AdminsService } from '../../services/admins.service';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { ForgetPasswordModalComponent } from './forget-password-modal.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, ForgetPasswordModalComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage: string = '';
  showForgetPasswordModal: boolean = false;

  private patientsService = inject(PatientsService);
  private adminsService = inject(AdminsService);
  private doctorsService = inject(DoctorsService);
  private nursesService = inject(NursesService);

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Try login endpoint first, fallback to signIn if needed
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          // Store remember me preference
          if (this.rememberMe) {
            // You can add additional logic here if needed
          }
          // Redirect based on role
          this.redirectAfterLogin();
          // Load profile data in background
          this.loadProfileInBackground();
        }
      },
      error: (error) => {
        this.isLoading = false;
        // If login fails, try signIn endpoint
        this.trySignIn();
      }
    });
  }

  private trySignIn() {
    this.authService.signIn(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token) {
          if (this.rememberMe) {
            // Additional logic for remember me
          }
          // Redirect based on role
          this.redirectAfterLogin();
          // Load profile data in background
          this.loadProfileInBackground();
        }
      },
      error: (error) => {
        this.isLoading = false;
        // Handle error
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
        console.error('Login error:', error);
      }
    });
  }

  openForgetPasswordModal() {
    this.showForgetPasswordModal = true;
  }

  closeForgetPasswordModal() {
    this.showForgetPasswordModal = false;
  }

  onPasswordResetSuccess() {
    this.closeForgetPasswordModal();
    // Optionally show a success message or redirect
  }

  /**
   * Redirect user to appropriate page based on their role after login
   */
  private redirectAfterLogin(): void {
    // Wait a bit for role service to initialize
    setTimeout(() => {
      const storedUser = this.authService.getCurrentUser();
      const role = storedUser?.role?.toLowerCase()?.trim() || '';
      
      if (role === 'user' || role === 'patient') {
        // User role: redirect to appointments
        this.router.navigate(['/appointments'], { replaceUrl: true });
      } else if (role === 'admin' || role === 'doctor' || role === 'nurse') {
        // Admin, Doctor, Nurse: redirect to dashboard
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        // Unknown role: default to appointments
        this.router.navigate(['/appointments'], { replaceUrl: true });
      }
    }, 100);
  }

  /**
   * Load user profile data in the background after login
   * This preloads the data so it's ready when user navigates to profile page
   */
  private loadProfileInBackground(): void {
    // Use setTimeout to ensure this runs after navigation
    setTimeout(() => {
      // Get current role and user ID, then preload data
      this.userService.getCurrentRole().subscribe({
        next: (role: string) => {
          const normalizedRole = (role || '').toLowerCase().trim();
          console.log('🔄 Background loading profile for role:', normalizedRole);
          
          // Get current user ID
          this.userService.getCurrentUser().subscribe({
            next: (user) => {
              const userId = user?.id || user?.userId || 0;
              if (userId && userId > 0) {
                // Preload the data based on role (fire and forget)
                this.preloadRoleData(normalizedRole, userId);
              }
            },
            error: (error) => {
              console.log('Background profile loading: Could not get user ID', error);
            }
          });
        },
        error: (error) => {
          console.log('Background profile loading: Could not get role', error);
        }
      });
    }, 500); // Small delay to ensure navigation completes
  }

  /**
   * Preload role-specific data in the background
   */
  private preloadRoleData(role: string, userId: number): void {
    switch (role) {
      case 'user':
      case 'patient':
        this.patientsService.getPatientById(userId).subscribe({
          next: () => console.log('✅ Background: Patient data preloaded'),
          error: () => console.log('⚠️ Background: Patient data preload failed')
        });
        break;
      case 'admin':
        this.adminsService.getAdminById(userId).subscribe({
          next: () => console.log('✅ Background: Admin data preloaded'),
          error: () => console.log('⚠️ Background: Admin data preload failed')
        });
        break;
      case 'doctor':
        this.doctorsService.getDoctorByUserId(userId).subscribe({
          next: () => console.log('✅ Background: Doctor data preloaded'),
          error: () => console.log('⚠️ Background: Doctor data preload failed')
        });
        break;
      case 'nurse':
        this.nursesService.getNurseByUserId(userId).subscribe({
          next: () => console.log('✅ Background: Nurse data preloaded'),
          error: () => console.log('⚠️ Background: Nurse data preload failed')
        });
        break;
      default:
        console.log('⚠️ Background: Unknown role:', role);
    }
  }
}