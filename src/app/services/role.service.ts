import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { DoctorsService } from './doctors.service';
import { NursesService } from './nurses.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<string | null>(null);
  public currentRole$ = this.currentRoleSubject.asObservable();

  private currentUserIdSubject = new BehaviorSubject<number | null>(null);
  public currentUserId$ = this.currentUserIdSubject.asObservable();

  private currentDoctorIdSubject = new BehaviorSubject<number | null>(null);
  public currentDoctorId$ = this.currentDoctorIdSubject.asObservable();

  private currentNurseIdSubject = new BehaviorSubject<number | null>(null);
  public currentNurseId$ = this.currentNurseIdSubject.asObservable();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService
  ) {
    this.initializeRole();
  }

  /**
   * Initialize role and user ID from storage or API
   */
  private initializeRole(): void {
    try {
      // Try to get from storage first
      const storedUser = this.authService.getCurrentUser();
      if (storedUser) {
        this.currentUserIdSubject.next(storedUser.id || storedUser.userId || null);
        if (storedUser.role) {
          this.currentRoleSubject.next(storedUser.role.toLowerCase());
        }
      }

      // Only fetch from API if user is authenticated
      if (this.authService.isAuthenticated()) {
        // Then fetch from API to ensure it's up to date
        this.userService.getCurrentRole().subscribe({
          next: (role) => {
            const normalizedRole = role?.toLowerCase().trim() || '';
            if (normalizedRole) {
              this.currentRoleSubject.next(normalizedRole);
            }
          },
          error: (error) => {
            console.error('Error fetching role:', error);
            // Don't clear existing role on error
          }
        });

        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            const userId = user?.id || user?.userId || null;
            if (userId) {
              this.currentUserIdSubject.next(userId);
              // If user is a doctor, fetch doctor ID
              // If user is a nurse, fetch nurse ID
              const currentRole = this.currentRoleSubject.value;
              if (currentRole === 'doctor' && userId) {
                this.loadDoctorId(userId);
              } else if (currentRole === 'nurse' && userId) {
                this.loadNurseId(userId);
              }
            }
          },
          error: (error) => {
            console.error('Error fetching user ID:', error);
            // Don't clear existing user ID on error
          }
        });
      }
    } catch (error) {
      console.error('Error initializing role service:', error);
    }
  }

  /**
   * Load doctor ID from user ID
   */
  private loadDoctorId(userId: number): void {
    this.doctorsService.getDoctorByUserId(userId).subscribe({
      next: (doctor) => {
        if (doctor && doctor.doctorId) {
          this.currentDoctorIdSubject.next(doctor.doctorId);
          console.log('✅ Doctor ID loaded:', doctor.doctorId);
        }
      },
      error: (error) => {
        console.error('Error fetching doctor ID:', error);
      }
    });
  }

  /**
   * Load nurse ID from user ID
   */
  private loadNurseId(userId: number): void {
    this.nursesService.getNurseByUserId(userId).subscribe({
      next: (nurse) => {
        if (nurse && nurse.nurseId) {
          this.currentNurseIdSubject.next(nurse.nurseId);
          console.log('✅ Nurse ID loaded:', nurse.nurseId);
        }
      },
      error: (error) => {
        console.error('Error fetching nurse ID:', error);
      }
    });
  }

  /**
   * Get current role synchronously
   */
  getCurrentRole(): string | null {
    return this.currentRoleSubject.value;
  }

  /**
   * Get current user ID synchronously
   */
  getCurrentUserId(): number | null {
    return this.currentUserIdSubject.value;
  }

  /**
   * Get current role as Observable
   */
  getCurrentRole$(): Observable<string | null> {
    return this.currentRole$;
  }

  /**
   * Get current user ID as Observable
   */
  getCurrentUserId$(): Observable<number | null> {
    return this.currentUserId$;
  }

  /**
   * Get current doctor ID synchronously
   */
  getCurrentDoctorId(): number | null {
    return this.currentDoctorIdSubject.value;
  }

  /**
   * Get current doctor ID as Observable
   */
  getCurrentDoctorId$(): Observable<number | null> {
    return this.currentDoctorIdSubject.asObservable();
  }

  /**
   * Get current nurse ID synchronously
   */
  getCurrentNurseId(): number | null {
    return this.currentNurseIdSubject.value;
  }

  /**
   * Get current nurse ID as Observable
   */
  getCurrentNurseId$(): Observable<number | null> {
    return this.currentNurseIdSubject.asObservable();
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: string): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === role.toLowerCase();
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;
    return roles.some(role => currentRole === role.toLowerCase());
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if current user is doctor
   */
  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  /**
   * Check if current user is nurse
   */
  isNurse(): boolean {
    return this.hasRole('nurse');
  }

  /**
   * Check if current user is patient/user
   */
  isUser(): boolean {
    return this.hasRole('user') || this.hasRole('patient');
  }

  /**
   * Check if user can perform management actions (edit, add, delete, activate/deactivate)
   */
  canManage(): boolean {
    return this.isAdmin() || this.isDoctor() || this.isNurse();
  }

  /**
   * Check if user can view reports
   */
  canViewReports(): boolean {
    // Doctors and nurses cannot view reports
    return this.isAdmin();
  }

  /**
   * Check if user can manage rooms
   */
  canManageRooms(): boolean {
    return this.isAdmin() || this.isDoctor() || this.isNurse();
  }

  /**
   * Check if user can manage patients (edit, activate/deactivate)
   */
  canManagePatients(): boolean {
    return this.isAdmin() || this.isDoctor() || this.isNurse();
  }

  /**
   * Check if user can manage nurses (edit, activate/deactivate)
   */
  canManageNurses(): boolean {
    // Nurses cannot manage other nurses
    return this.isAdmin() || this.isDoctor();
  }

  /**
   * Check if user can manage doctors (edit, activate/deactivate)
   */
  canManageDoctors(): boolean {
    // Only admins can manage doctors
    return this.isAdmin();
  }

  /**
   * Check if user can manage admins (activate/deactivate)
   */
  canManageAdmins(): boolean {
    // Only admins can manage admins (activate/inactivate)
    return this.isAdmin();
  }

  /**
   * Check if user can edit admin data
   */
  canEditAdmin(adminId?: number): boolean {
    // Admins cannot edit other admins' data
    // They can only edit their own profile
    if (!this.isAdmin()) return false;
    
    // If adminId is provided, check if it's the current user
    if (adminId) {
      const currentUserId = this.getCurrentUserId();
      return adminId === currentUserId;
    }
    
    // If no adminId provided, return false (cannot edit other admins)
    return false;
  }

  /**
   * Check if user can activate/inactivate admins
   */
  canActivateAdmin(adminId?: number): boolean {
    // Admins can activate/inactivate other admins
    if (!this.isAdmin()) return false;
    
    // If adminId is provided, check if it's not the current user (can't deactivate self)
    if (adminId) {
      const currentUserId = this.getCurrentUserId();
      return adminId !== currentUserId;
    }
    
    return true;
  }

  /**
   * Check if user can create new admins
   */
  canCreateAdmin(): boolean {
    // Only admins can create new admins
    return this.isAdmin();
  }

  /**
   * Check if user can book appointments
   */
  canBookAppointments(): boolean {
    // Doctors and nurses cannot book appointments
    return !this.isDoctor() && !this.isNurse();
  }

  /**
   * Check if user can assign appointments
   */
  canAssignAppointments(): boolean {
    // Nurses cannot assign appointments
    return !this.isNurse();
  }

  /**
   * Check if user can cancel appointments
   */
  canCancelAppointments(): boolean {
    // Nurses cannot cancel appointments
    return !this.isNurse();
  }

  /**
   * Check if user can close appointments
   */
  canCloseAppointments(): boolean {
    // Nurses cannot close appointments
    return !this.isNurse();
  }

  /**
   * Check if user can add feedback
   */
  canAddFeedback(): boolean {
    // Doctors and nurses cannot add feedback
    return !this.isDoctor() && !this.isNurse();
  }

  /**
   * Check if user can edit feedback
   */
  canEditFeedback(): boolean {
    // Doctors cannot edit feedback
    return !this.isDoctor();
  }

  /**
   * Check if user can delete feedback
   */
  canDeleteFeedback(): boolean {
    // Doctors cannot delete feedback
    return !this.isDoctor();
  }

  /**
   * Check if user can reply to feedback
   */
  canReplyToFeedback(): boolean {
    // Only doctors can reply to feedback, nurses cannot
    return this.isAdmin() || this.isDoctor();
  }

  /**
   * Check if user can toggle favorite on feedback
   */
  canToggleFavoriteFeedback(): boolean {
    // Nurses cannot toggle favorite
    return !this.isNurse();
  }

  /**
   * Refresh role and user ID from API
   */
  refresh(): void {
    this.initializeRole();
    // If doctor, reload doctor ID
    // If nurse, reload nurse ID
    const currentRole = this.getCurrentRole();
    const currentUserId = this.getCurrentUserId();
    if (currentRole === 'doctor' && currentUserId) {
      this.loadDoctorId(currentUserId);
    } else if (currentRole === 'nurse' && currentUserId) {
      this.loadNurseId(currentUserId);
    }
  }
}

