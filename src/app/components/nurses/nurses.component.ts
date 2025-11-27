import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Nurse {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
  active: boolean;
  photo?: string;
  experience?: string;
  shift?: string;
}

@Component({
  selector: 'app-nurses',
  standalone: true,
  templateUrl: './nurses.component.html',
  styleUrls: ['./nurses.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class Nurses {
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  departments: string[] = ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Cardiology', 'Maternity'];

  // Sidebar menu items
  menuItems = [
    { name: 'Dashboard', icon: 'fas fa-chart-line', active: false },
    { name: 'Patients', icon: 'fas fa-user-injured', active: false },
    { name: 'Doctors', icon: 'fas fa-user-md', active: false },
    { name: 'Nurses', icon: 'fas fa-user-nurse', active: true },
    { name: 'Schedule', icon: 'fas fa-calendar-alt', active: false },
    { name: 'Documents', icon: 'fas fa-file-medical', active: false },
    { name: 'Profile', icon: 'fas fa-user', active: false },
    { name: 'Settings', icon: 'fas fa-cog', active: false },
    { name: 'Support', icon: 'fas fa-headset', active: false }
  ];

  nurses: Nurse[] = [
    { 
      id: 1, 
      name: 'Nurse Hala Mohamed', 
      department: 'Emergency', 
      email: 'hala.mohamed@example.com', 
      phone: '01011111111', 
      active: true, 
      photo: 'https://randomuser.me/api/portraits/women/12.jpg',
      experience: '8 years',
      shift: 'Day Shift'
    },
    { 
      id: 2, 
      name: 'Nurse Mona Ahmed', 
      department: 'ICU', 
      email: 'mona.ahmed@example.com', 
      phone: '01022222222', 
      active: false, 
      photo: 'https://randomuser.me/api/portraits/women/33.jpg',
      experience: '5 years',
      shift: 'Night Shift'
    },
    { 
      id: 3, 
      name: 'Nurse Samir Hassan', 
      department: 'Surgery', 
      email: 'samir.hassan@example.com', 
      phone: '01033333333', 
      active: true, 
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      experience: '7 years',
      shift: 'Day Shift'
    },
    { 
      id: 4, 
      name: 'Nurse Yara Mahmoud', 
      department: 'Pediatrics', 
      email: 'yara.mahmoud@example.com', 
      phone: '01044444444', 
      active: true, 
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      experience: '6 years',
      shift: 'Rotating Shift'
    },
    { 
      id: 5, 
      name: 'Nurse Rania Ali', 
      department: 'Cardiology', 
      email: 'rania.ali@example.com', 
      phone: '01055555555', 
      active: true, 
      photo: 'https://randomuser.me/api/portraits/women/55.jpg',
      experience: '10 years',
      shift: 'Day Shift'
    },
    { 
      id: 6, 
      name: 'Nurse Omar Khaled', 
      department: 'Maternity', 
      email: 'omar.khaled@example.com', 
      phone: '01066666666', 
      active: false, 
      photo: 'https://randomuser.me/api/portraits/men/66.jpg',
      experience: '4 years',
      shift: 'Night Shift'
    }
  ];

  // Today's date
  todayDate: string = '';
  todayDay: string = '';

  constructor() {
    this.setTodayDate();
  }

  setTodayDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', options);
    
    const parts = dateString.split(', ');
    this.todayDay = parts[0];
    this.todayDate = parts.slice(1).join(', ');
  }

  getCardColor(department: string, index: number): string {
    // alternating colors for cards
    return index % 2 === 0 ? '#e6ccff' : '#f2f2f2'; 
  }

  getDepartmentIcon(department: string): string {
    switch (department.toLowerCase()) {
      case 'emergency': return 'fas fa-ambulance';
      case 'icu': return 'fas fa-procedures';
      case 'pediatrics': return 'fas fa-baby';
      case 'surgery': return 'fas fa-syringe';
      case 'cardiology': return 'fas fa-heartbeat';
      case 'maternity': return 'fas fa-baby-carriage';
      default: return 'fas fa-user-nurse';
    }
  }

  setActiveMenu(item: any) {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }

  countActive(): number {
    return this.nurses.filter(n => n.active).length;
  }

  countInactive(): number {
    return this.nurses.filter(n => !n.active).length;
  }

  filteredNurses(): Nurse[] {
    return this.nurses
      .filter(n => n.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(n => !this.selectedDepartment || n.department === this.selectedDepartment)
      .filter(n => !this.selectedStatus || 
            (this.selectedStatus === 'Active' && n.active) || 
            (this.selectedStatus === 'Inactive' && !n.active)
      );
  }

  sortByName(): void {
    this.nurses.sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleStatus(nurse: Nurse): void {
    nurse.active = !nurse.active;
  }

  // أضف هذه الدالة للتصفية
  clearAllFilters() {
   this.searchTerm = '';
   this.selectedDepartment = '';
   this.selectedStatus = '';
  }
}