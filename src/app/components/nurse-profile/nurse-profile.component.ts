import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Nurse {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
  active: boolean;
  photo: string;
  experience: string;
  shift: string;
  education: string;
  languages: string[];
  certifications: string[];
  bio: string;
  rating: number;
  patients: number;
}

@Component({
  selector: 'app-nurse-profile',
  templateUrl: './nurse-profile.component.html',
  styleUrls: ['./nurse-profile.component.css'],
  imports: [NgIf, NgClass, RouterModule, CommonModule]
})
export class NurseProfile {
  nurse: Nurse | undefined;

  nursesList: Nurse[] = [
    { 
      id: 1, 
      name: 'Nurse Hala Mohamed', 
      department: 'Emergency', 
      email: 'hala.mohamed@example.com', 
      phone: '01011111111', 
      active: true, 
      photo: 'https://randomuser.me/api/portraits/women/12.jpg',
      experience: '8 years',
      shift: 'Day Shift (7:00 AM - 3:00 PM)',
      education: 'BSN - Cairo University',
      languages: ['Arabic', 'English'],
      certifications: ['ACLS', 'PALS', 'BLS'],
      bio: 'Experienced emergency nurse with 8+ years in trauma care and emergency response. Specialized in critical care and patient stabilization.',
      rating: 4.8,
      patients: 1250
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
      shift: 'Night Shift (11:00 PM - 7:00 AM)',
      education: 'BSN - Alexandria University',
      languages: ['Arabic', 'English', 'French'],
      certifications: ['CCRN', 'BLS', 'ACLS'],
      bio: 'ICU specialist with 5 years of experience in intensive care unit management and critical patient monitoring.',
      rating: 4.6,
      patients: 890
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
      shift: 'Day Shift (7:00 AM - 3:00 PM)',
      education: 'BSN - Ain Shams University',
      languages: ['Arabic', 'English'],
      certifications: ['CNOR', 'BLS', 'ACLS'],
      bio: 'Operating room nurse with extensive experience in surgical procedures, sterile techniques, and post-operative care.',
      rating: 4.7,
      patients: 2100
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
      shift: 'Rotating Shift',
      education: 'BSN Pediatrics - Mansoura University',
      languages: ['Arabic', 'English'],
      certifications: ['PALS', 'BLS', 'Pediatric Nursing'],
      bio: 'Pediatric nurse specialist with 6 years of experience in child healthcare, vaccination, and developmental pediatrics.',
      rating: 4.9,
      patients: 1800
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
      shift: 'Day Shift (7:00 AM - 3:00 PM)',
      education: 'MSN Cardiology - Cairo University',
      languages: ['Arabic', 'English'],
      certifications: ['ACLS', 'BLS', 'Cardiac Nursing'],
      bio: 'Cardiac care nurse with decade of experience in cardiovascular diseases, ECG monitoring, and cardiac rehabilitation.',
      rating: 4.8,
      patients: 2750
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
      shift: 'Night Shift (11:00 PM - 7:00 AM)',
      education: 'BSN - Zagazig University',
      languages: ['Arabic', 'English'],
      certifications: ['NRP', 'BLS', 'Maternal Nursing'],
      bio: 'Maternity ward nurse specialized in labor and delivery, postpartum care, and newborn assessment.',
      rating: 4.5,
      patients: 950
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.nurse = this.nursesList.find(n => n.id === id);
  }

  toggleActive() {
    if (this.nurse) {
      this.nurse.active = !this.nurse.active;
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
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

  navigateToNursesList() {
    this.router.navigate(['/nurses']);
  }
}
