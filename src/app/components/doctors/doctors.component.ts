import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  photo?: string;
  active: boolean;
  state: string;
}

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DoctorsCompomemt {
  searchTerm: string = '';
  selectedSpecialty: string = '';
  selectedState: string = '';

  specialties: string[] = ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics'];
  states: string[] = ['Active', 'Inactive'];

// Sidebar menu items
  menuItems = [
    { name: 'Dashboard', icon: 'fas fa-chart-line', active: false },
    { name: 'Patients', icon: 'fas fa-user-injured', active: false },
    { name: 'Doctors', icon: 'fas fa-user-md', active: true },
    { name: 'Nurses', icon: 'fas fa-user-nurse', active: false },
    { name: 'Schedule', icon: 'fas fa-calendar-alt', active: false },
    { name: 'Documents', icon: 'fas fa-file-medical', active: false },
    { name: 'Profile', icon: 'fas fa-user', active: false },
    { name: 'Settings', icon: 'fas fa-cog', active: false },
    { name: 'Support', icon: 'fas fa-headset', active: false }
  ];
  
  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Ahmed Ali', specialty: 'Cardiology', email: 'ahmed.ali@example.com', phone: '01012345678', photo: 'https://randomuser.me/api/portraits/men/34.jpg', active: true, state: 'Active' },
    { id: 2, name: 'Dr. Sara Hassan', specialty: 'Dermatology', email: 'sara.hassan@example.com', phone: '01023456789', photo: 'https://randomuser.me/api/portraits/women/43.jpg', active: false, state: 'Inactive' },
    { id: 3, name: 'Dr. Mohamed Farid', specialty: 'Pediatrics', email: 'mohamed.farid@example.com', phone: '01034567890', photo: 'https://randomuser.me/api/portraits/men/33.jpg', active: true, state: 'Active' },
    { id: 4, name: 'Dr. Amina Khaled', specialty: 'Neurology', email: 'amina.khaled@example.com', phone: '01045678901', photo: 'https://randomuser.me/api/portraits/women/44.jpg', active: true, state: 'Active' },
    { id: 5, name: 'Dr. Khaled Saeed', specialty: 'Orthopedics', email: 'khaled.saeed@example.com', phone: '01056789012', photo: 'https://randomuser.me/api/portraits/men/36.jpg', active: false, state: 'Inactive' }
  ];

  // Today's date - initialized with default values
  todayDate: string = '';
  todayDay: string = '';

    constructor() {
    this.setTodayDate();
  }

   setTodayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', options);
    
    // Split the date string to get day and date separately
    const parts = dateString.split(', ');
    this.todayDay = parts[0];
    this.todayDate = parts.slice(1).join(', ');
  }

  getSpecialtyIcon(specialty: string): string {
    switch (specialty.toLowerCase()) {
      case 'cardiology': return 'fas fa-heartbeat';
      case 'neurology': return 'fas fa-brain';
      case 'pediatrics': return 'fas fa-baby';
      case 'dentistry': return 'fas fa-tooth';
      case 'orthopedics': return 'fas fa-bone';
      default: return 'fas fa-user-md';
    }
  }

  getCardColor(specialty: string, index: number): string {
    // alternating colors for cards
    return index % 2 === 0 ? '#e6ccff' : '#f2f2f2'; 
  }

  filteredDoctors(): Doctor[] {
    return this.doctors
      .filter(d => d.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(d => !this.selectedSpecialty || d.specialty === this.selectedSpecialty)
      .filter(d => !this.selectedState || d.state === this.selectedState);
  }

  sortByName() {
    this.doctors.sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleActive(doctor: Doctor) {
    doctor.active = !doctor.active;
    doctor.state = doctor.active ? 'Active' : 'Inactive';
  }

    setActiveMenu(item: any) {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }
  countActive(): number {
    return this.doctors.filter(n => n.active).length;
  }

  countInactive(): number {
    return this.doctors.filter(n => !n.active).length;
  }

  // أضف هذه الدالة للتصفية
  clearAllFilters() {
   this.searchTerm = '';
   this.selectedSpecialty = '';
   this.selectedState = '';
  }
}