import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: string;
  photo: string;
  address: string;
  emergencyContact: string;
  qualifications: string[];
  skills: string[];
  languages: string[];
  lastLogin: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class UserProfile {
  
  user: User = {
    id: 1001,
    name: 'Dr. Mahmoud Ahmed',
    email: 'mahmoud.ahmed@medicare.com',
    phone: '+20 100 123 4567',
    role: 'Senior Doctor',
    department: 'Cardiology',
    joinDate: 'January 15, 2020',
    status: 'Active',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    address: '123 Medical Street, Cairo, Egypt',
    emergencyContact: '+20 100 987 6543',
    qualifications: [
      'MD Cardiology - Cairo University',
      'Board Certified Cardiologist',
      'PhD in Cardiovascular Medicine'
    ],
    skills: [
      'Cardiac Surgery',
      'Echocardiography',
      'Cardiac Catheterization',
      'Patient Management',
      'Medical Research'
    ],
    languages: ['Arabic', 'English', 'French'],
    lastLogin: 'Today, 09:30 AM'
  };

  // Edit mode
  isEditMode = false;
  editedUser: User = { ...this.user };

  // Statistics
  stats = [
    { label: 'Patients Treated', value: '1,247', icon: 'fas fa-user-injured', color: '#1e90ff' },
    { label: 'Appointments', value: '156', icon: 'fas fa-calendar-check', color: '#28a745' },
    { label: 'Success Rate', value: '98%', icon: 'fas fa-chart-line', color: '#ff6b6b' },
    { label: 'Experience', value: '4.5 Years', icon: 'fas fa-award', color: '#ffc107' }
  ];

  // Recent Activities
  recentActivities = [
    { 
      action: 'Patient Consultation', 
      patient: 'Ahmed Mohamed', 
      time: '2 hours ago',
      type: 'consultation',
      icon: 'fas fa-stethoscope'
    },
    { 
      action: 'Medical Report', 
      patient: 'Sara Ali', 
      time: '4 hours ago',
      type: 'report',
      icon: 'fas fa-file-medical'
    },
    { 
      action: 'Appointment Scheduled', 
      patient: 'Nour Hassan', 
      time: 'Yesterday',
      type: 'appointment',
      icon: 'fas fa-calendar-plus'
    },
    { 
      action: 'Lab Results Reviewed', 
      patient: 'Karim Samy', 
      time: '2 days ago',
      type: 'lab',
      icon: 'fas fa-vial'
    }
  ];

  constructor() {}

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.editedUser = { ...this.user };
    }
  }

  saveProfile() {
    this.user = { ...this.editedUser };
    this.isEditMode = false;
    // Here you would typically make an API call to save the data
  }

  cancelEdit() {
    this.editedUser = { ...this.user };
    this.isEditMode = false;
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'consultation': return '#1e90ff';
      case 'report': return '#28a745';
      case 'appointment': return '#ffc107';
      case 'lab': return '#ff6b6b';
      default: return '#6c757d';
    }
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editedUser.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('profilePhotoInput');
    if (fileInput) {
      fileInput.click();
    }
  }
  // دالة للحصول على اليوم
  getCurrentDay(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // دالة للحصول على التاريخ الكامل
  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}