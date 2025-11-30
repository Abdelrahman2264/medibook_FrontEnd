import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PatientsService } from '../../services/patients.service';
import { AdminsService } from '../../services/admins.service';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { Patient, mapUserDetailsDtoToPatient, UpdatePatientDto } from '../../models/patient.model';
import { Admin, mapUserDetailsDtoToAdmin, UpdateAdminDto } from '../../models/admin.model';
import { Doctor, mapDoctorDetailsDtoToDoctor, UpdateDoctorDto, CreateDoctorDto } from '../../models/doctor.model';
import { Nurse, mapNurseDetailsDtoToNurse, UpdateNurseDto } from '../../models/nurse.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class UserProfile implements OnInit {
  
  // Role-specific data - use actual DTOs
  patient: Patient | null = null;
  admin: Admin | null = null;
  doctor: Doctor | null = null;
  nurse: Nurse | null = null;

  isLoading: boolean = true;
  errorMessage: string = '';
  currentRole: string = '';
  currentUserId: number = 0;
  errorDetails: any = null;

  // Edit mode
  isEditMode = false;
  isSaving = false;
  successMessage: string = '';

  constructor(
    private userService: UserService,
    private patientsService: PatientsService,
    private adminsService: AdminsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    this.errorDetails = null;

    // Step 1: Get current role from API
    this.userService.getCurrentRole().subscribe({
      next: (role: string) => {
        console.log('✅ Current role received:', role);
        this.currentRole = (role || '').toLowerCase().trim();
        
        // Step 2: Get current user to get the ID
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            console.log('✅ Current user received:', user);
            this.currentUserId = user?.id || user?.userId || 0;
            
            if (!this.currentUserId || this.currentUserId === 0) {
              this.isLoading = false;
              this.errorMessage = 'Invalid user ID. Please try logging in again.';
              return;
            }

            // Step 3: Load role-based data
            this.loadRoleBasedData();
          },
          error: (error) => {
            console.error('❌ Error loading current user:', error);
            this.errorDetails = error;
            this.isLoading = false;
            this.errorMessage = this.getErrorMessage(error, 'user');
          }
        });
      },
      error: (error) => {
        console.error('❌ Error loading current role:', error);
        this.errorDetails = error;
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error, 'role');
      }
    });
  }

  loadRoleBasedData() {
    if (!this.currentUserId || this.currentUserId === 0) {
      this.isLoading = false;
      this.errorMessage = 'Invalid user ID.';
      return;
    }

    const normalizedRole = this.currentRole.toLowerCase();
    
    switch (normalizedRole) {
      case 'user':
      case 'patient':
        this.loadPatientData();
        break;
      case 'admin':
        this.loadAdminData();
        break;
      case 'doctor':
        this.loadDoctorData();
        break;
      case 'nurse':
        this.loadNurseData();
        break;
      default:
        // Default to patient if role is unknown
        this.loadPatientData();
        break;
    }
  }

  loadPatientData() {
    console.log('🔄 Loading patient data for user ID:', this.currentUserId);
    this.patientsService.getPatientById(this.currentUserId).subscribe({
      next: (patient: Patient) => {
        try {
          if (!patient || !patient.id) {
            throw new Error('Invalid patient data received');
          }
          this.patient = patient;
          this.isLoading = false;
          this.errorMessage = '';
          this.errorDetails = null;
          console.log('✅ Patient data loaded:', patient);
          console.log('🔍 Component state:', {
            patient: !!this.patient,
            admin: !!this.admin,
            doctor: !!this.doctor,
            nurse: !!this.nurse,
            isLoading: this.isLoading
          });
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error processing patient data:', error);
          this.handleLoadError('Failed to process patient data.');
        }
      },
      error: (error) => {
        console.error('Error loading patient data:', error);
        this.errorDetails = error;
        this.handleLoadError(this.getErrorMessage(error, 'patient'));
      }
    });
  }

  loadAdminData() {
    console.log('🔄 Loading admin data for user ID:', this.currentUserId);
    this.adminsService.getAdminById(this.currentUserId).subscribe({
      next: (admin: Admin) => {
        try {
          if (!admin || !admin.id) {
            throw new Error('Invalid admin data received');
          }
          this.admin = admin;
          this.isLoading = false;
          this.errorMessage = '';
          this.errorDetails = null;
          console.log('✅ Admin data loaded:', admin);
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error processing admin data:', error);
          this.handleLoadError('Failed to process admin data.');
        }
      },
      error: (error) => {
        console.error('Error loading admin data:', error);
        this.errorDetails = error;
        this.handleLoadError(this.getErrorMessage(error, 'admin'));
      }
    });
  }

  loadDoctorData() {
    console.log('🔄 Loading doctor data for user ID:', this.currentUserId);
    this.doctorsService.getDoctorByUserId(this.currentUserId).subscribe({
      next: (doctor: Doctor) => {
        try {
          if (!doctor || !doctor.userId) {
            throw new Error('Invalid doctor data received');
          }
          this.doctor = doctor;
          this.isLoading = false;
          this.errorMessage = '';
          this.errorDetails = null;
          console.log('✅ Doctor data loaded:', doctor);
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error processing doctor data:', error);
          this.handleLoadError('Failed to process doctor data.');
        }
      },
      error: (error) => {
        console.error('Error loading doctor data:', error);
        this.errorDetails = error;
        this.handleLoadError(this.getErrorMessage(error, 'doctor'));
      }
    });
  }

  loadNurseData() {
    console.log('🔄 Loading nurse data for user ID:', this.currentUserId);
    this.nursesService.getNurseByUserId(this.currentUserId).subscribe({
      next: (nurse: Nurse) => {
        try {
          if (!nurse || !nurse.userId) {
            throw new Error('Invalid nurse data received');
          }
          this.nurse = nurse;
          this.isLoading = false;
          this.errorMessage = '';
          this.errorDetails = null;
          console.log('✅ Nurse data loaded:', nurse);
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error processing nurse data:', error);
          this.handleLoadError('Failed to process nurse data.');
        }
      },
      error: (error) => {
        console.error('Error loading nurse data:', error);
        this.errorDetails = error;
        this.handleLoadError(this.getErrorMessage(error, 'nurse'));
      }
    });
  }

  getErrorMessage(error: any, roleType: string): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.status === 403) {
      return 'You do not have permission to access this information.';
    }
    if (error.status === 404) {
      return `${roleType.charAt(0).toUpperCase() + roleType.slice(1)} profile not found.`;
    }
    if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    if (error.status === 0 || error.status === undefined) {
      return 'Network error. Please check your internet connection.';
    }
    return error.error?.message || error.message || `Failed to load ${roleType} data. Please try again.`;
  }

  handleLoadError(customMessage?: string) {
    this.isLoading = false;
    this.errorMessage = customMessage || 'Failed to load user profile. Please try again later.';
  }

  // Helper methods to get current data based on role
  getCurrentData(): Patient | Admin | Doctor | Nurse | null {
    if (this.patient) return this.patient;
    if (this.admin) return this.admin;
    if (this.doctor) return this.doctor;
    if (this.nurse) return this.nurse;
    return null;
  }

  getFullName(): string {
    try {
      const data = this.getCurrentData();
      if (!data) return 'User';
      if ('fullName' in data && data.fullName) return data.fullName;
      if ('firstName' in data && 'lastName' in data) {
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || 'User';
      }
      return 'User';
    } catch (error) {
      console.error('Error getting full name:', error);
      return 'User';
    }
  }

  getEmail(): string {
    try {
      const data = this.getCurrentData();
      if (!data || !('email' in data)) return '';
      return data.email || '';
    } catch (error) {
      console.error('Error getting email:', error);
      return '';
    }
  }

  getPhone(): string {
    try {
      const data = this.getCurrentData();
      if (!data || !('mobilePhone' in data)) return '';
      return data.mobilePhone || '';
    } catch (error) {
      console.error('Error getting phone:', error);
      return '';
    }
  }

  getProfileImage(): string {
    try {
      const data = this.getCurrentData();
      if (!data) return 'assets/images/patient-placeholder.png';
      
      let image = '';
      if ('profileImage' in data) image = data.profileImage || '';
      if ('photoUrl' in data) image = data.photoUrl || '';
      
      if (image && !image.startsWith('data:') && !image.startsWith('http') && !image.startsWith('assets/')) {
        return `data:image/jpeg;base64,${image}`;
      }
      return image || this.getDefaultImage();
    } catch (error) {
      console.error('Error getting profile image:', error);
      return this.getDefaultImage();
    }
  }

  getDefaultImage(): string {
    if (this.patient) return 'assets/images/patient-placeholder.png';
    if (this.admin) return 'assets/images/admin-placeholder.png';
    if (this.doctor) return 'assets/images/doctor-placeholder.png';
    if (this.nurse) return 'assets/images/nurse-placeholder.png';
    return 'assets/images/patient-placeholder.png';
  }

  getRole(): string {
    if (this.patient) return 'Patient';
    if (this.admin) return 'Admin';
    if (this.doctor) return 'Doctor';
    if (this.nurse) return 'Nurse';
    return 'User';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  getStatusBadgeClass(isActive?: boolean): string {
    if (isActive === undefined) {
      const data = this.getCurrentData();
      if (data && 'isActive' in data) {
        isActive = data.isActive;
      } else {
        isActive = false;
      }
    }
    return isActive ? 'status-badge active' : 'status-badge inactive';
  }

  getGenderIcon(gender?: string): string {
    if (!gender) return 'fas fa-genderless';
    const g = gender.toLowerCase();
    if (g.includes('male') && !g.includes('female')) return 'fas fa-mars';
    if (g.includes('female')) return 'fas fa-venus';
    return 'fas fa-genderless';
  }

  getSpecialtyIcon(specialization?: string): string {
    if (!specialization) return 'fas fa-user-md';
    // Add logic for different specialties if needed
    return 'fas fa-stethoscope';
  }

  getExperienceLevel(): string {
    if (!this.doctor || !this.doctor.experienceYears) return 'Junior';
    const years = this.doctor.experienceYears;
    if (years < 3) return 'Junior';
    if (years < 7) return 'Mid-level';
    if (years < 15) return 'Senior';
    return 'Expert';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    if (!this.currentUserId || this.currentUserId === 0) {
      this.errorMessage = 'Invalid user ID. Cannot save profile.';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const normalizedRole = this.currentRole.toLowerCase();

    switch (normalizedRole) {
      case 'user':
      case 'patient':
        this.savePatientProfile();
        break;
      case 'admin':
        this.saveAdminProfile();
        break;
      case 'doctor':
        this.saveDoctorProfile();
        break;
      case 'nurse':
        this.saveNurseProfile();
        break;
      default:
        this.isSaving = false;
        this.errorMessage = 'Unknown role. Cannot save profile.';
        setTimeout(() => this.errorMessage = '', 5000);
    }
  }

  savePatientProfile() {
    if (!this.patient) {
      this.isSaving = false;
      this.errorMessage = 'Patient data not loaded.';
      return;
    }

    const updateDto: UpdatePatientDto = {
      firstName: this.patient.firstName,
      lastName: this.patient.lastName,
      mobilePhone: this.patient.mobilePhone,
      gender: this.patient.gender,
      mitrialStatus: this.patient.mitrialStatus,
      profileImage: this.patient.profileImage
    };

    this.patientsService.updatePatient(this.patient.id, updateDto).subscribe({
      next: (updatedPatient) => {
        // Update local patient data
        this.patient = mapUserDetailsDtoToPatient(updatedPatient);
        this.isSaving = false;
        this.isEditMode = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 5000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating patient profile:', error);
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error, 'patient');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  saveAdminProfile() {
    if (!this.admin) {
      this.isSaving = false;
      this.errorMessage = 'Admin data not loaded.';
      return;
    }

    const updateDto: UpdateAdminDto = {
      firstName: this.admin.firstName,
      lastName: this.admin.lastName,
      mobilePhone: this.admin.mobilePhone,
      gender: this.admin.gender,
      mitrialStatus: this.admin.mitrialStatus,
      profileImage: this.admin.profileImage
    };

    this.adminsService.updateAdmin(this.admin.id, updateDto).subscribe({
      next: (updatedAdmin) => {
        // Update local admin data
        this.admin = mapUserDetailsDtoToAdmin(updatedAdmin);
        this.isSaving = false;
        this.isEditMode = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 5000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating admin profile:', error);
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error, 'admin');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  saveDoctorProfile() {
    if (!this.doctor) {
      this.isSaving = false;
      this.errorMessage = 'Doctor data not loaded.';
      return;
    }

    // Use Partial<CreateDoctorDto> format as expected by the service
    const updateDto: Partial<CreateDoctorDto> = {
      firstName: this.doctor.firstName,
      lastName: this.doctor.lastName,
      mobilePhone: this.doctor.mobilePhone,
      bio: this.doctor.bio,
      specialization: this.doctor.specialization,
      type: this.doctor.type,
      experienceYears: this.doctor.experienceYears,
      profileImage: this.doctor.photoUrl || null
    };

    // Use doctorId for update endpoint
    this.doctorsService.updateDoctor(this.doctor.doctorId, updateDto).subscribe({
      next: (updatedDoctorDto) => {
        // Update local doctor data
        this.doctor = mapDoctorDetailsDtoToDoctor(updatedDoctorDto);
        this.isSaving = false;
        this.isEditMode = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 5000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating doctor profile:', error);
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error, 'doctor');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  saveNurseProfile() {
    if (!this.nurse) {
      this.isSaving = false;
      this.errorMessage = 'Nurse data not loaded.';
      return;
    }

    const updateDto: UpdateNurseDto = {
      firstName: this.nurse.firstName,
      lastName: this.nurse.lastName,
      mobilePhone: this.nurse.mobilePhone,
      bio: this.nurse.bio,
      profileImage: this.nurse.photoUrl || null
    };

    // Use nurseId for update endpoint
    this.nursesService.updateNurse(this.nurse.nurseId, updateDto).subscribe({
      next: (updatedNurseDto) => {
        // Update local nurse data
        this.nurse = mapNurseDetailsDtoToNurse(updatedNurseDto);
        this.isSaving = false;
        this.isEditMode = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 5000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating nurse profile:', error);
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error, 'nurse');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    // Reload data to discard changes
    this.loadUserProfile();
  }

  retryLoad() {
    this.loadUserProfile();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
