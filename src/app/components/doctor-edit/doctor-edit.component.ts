import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { Doctor, UpdateDoctorDto } from '../../models/doctor.model';

@Component({
  selector: 'app-doctor-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-edit.component.html',
  styleUrls: ['./doctor-edit.component.css']
})
export class DoctorEditComponent implements OnInit {
  doctor: Doctor | null = null;
  originalDoctor: Doctor | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  
  // Form data
  doctorForm: {
    firstName: string;
    lastName: string;
    mobilePhone: string;
    bio: string;
    specialization: string;
    type: string;
    experienceYears: number;
    profileImage: string | null;
  } = {
    firstName: '',
    lastName: '',
    mobilePhone: '',
    bio: '',
    specialization: '',
    type: '',
    experienceYears: 0,
    profileImage: null
  };

  profileImagePreview: string = '';
  specialties: string[] = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dentistry'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsService: DoctorsService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      this.loadDoctor(Number(id));
    } else {
      this.errorMessage = 'Invalid doctor ID';
      this.isLoading = false;
    }
  }

  loadDoctor(id: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.doctorsService.getDoctorById(id).subscribe({
      next: (doctor: Doctor) => {
        this.doctor = doctor;
        this.originalDoctor = { ...doctor }; // Deep copy for comparison
        this.populateForm();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading doctor:', error);
        this.errorMessage = 'Failed to load doctor data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private populateForm() {
    if (!this.doctor) return;

    this.doctorForm = {
      firstName: this.doctor.firstName || '',
      lastName: this.doctor.lastName || '',
      mobilePhone: this.doctor.mobilePhone || '',
      bio: this.doctor.bio || '',
      specialization: this.doctor.specialization || '',
      type: this.doctor.type || '',
      experienceYears: this.doctor.experienceYears || 0,
      profileImage: this.doctor.photoUrl || null
    };

    this.profileImagePreview = this.doctor.photoUrl || '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
        this.doctorForm.profileImage = e.target.result;
        this.errorMessage = '';
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.profileImagePreview = '';
    this.doctorForm.profileImage = null;
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.doctorForm.firstName?.trim()) {
      this.errorMessage = 'First Name is required';
      return false;
    }

    if (!this.doctorForm.lastName?.trim()) {
      this.errorMessage = 'Last Name is required';
      return false;
    }

    if (!this.doctorForm.specialization?.trim()) {
      this.errorMessage = 'Specialization is required';
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm() || !this.doctor || !this.originalDoctor) {
      return;
    }

    // Build UpdateDoctorDto with only changed fields
    const updateData: UpdateDoctorDto = {};

    if (this.doctorForm.firstName !== this.originalDoctor.firstName) {
      updateData.firstName = this.doctorForm.firstName.trim();
    }

    if (this.doctorForm.lastName !== this.originalDoctor.lastName) {
      updateData.lastName = this.doctorForm.lastName.trim();
    }

    if (this.doctorForm.mobilePhone !== this.originalDoctor.mobilePhone) {
      updateData.mobilePhone = this.doctorForm.mobilePhone.trim();
    }

    if (this.doctorForm.bio !== this.originalDoctor.bio) {
      updateData.bio = this.doctorForm.bio.trim();
    }

    if (this.doctorForm.specialization !== this.originalDoctor.specialization) {
      updateData.specialization = this.doctorForm.specialization;
    }

    if (this.doctorForm.type !== this.originalDoctor.type) {
      updateData.type = this.doctorForm.type.trim();
    }

    if (this.doctorForm.experienceYears !== this.originalDoctor.experienceYears) {
      updateData.experienceYears = this.doctorForm.experienceYears;
    }

    if (this.doctorForm.profileImage !== this.originalDoctor.photoUrl) {
      updateData.profileImage = this.doctorForm.profileImage;
    }

    // Check if there are any changes
    if (Object.keys(updateData).length === 0) {
      this.errorMessage = 'No changes detected';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.doctorsService.updateDoctor(this.doctor.doctorId, updateData).subscribe({
      next: (response: any) => {
        console.log('Doctor updated successfully');
        this.router.navigate(['/doctors', this.doctor!.doctorId]);
      },
      error: (error: any) => {
        console.error('Error updating doctor:', error);
        this.errorMessage = 'Failed to update doctor. Please try again.';
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/doctors', this.doctor?.doctorId]);
  }
}





