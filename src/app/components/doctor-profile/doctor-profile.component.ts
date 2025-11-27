import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  photo: string;
  active: boolean;
  state: string;
  bio: string;
  experience: string;
  education: string;
  languages: string[];
  rating: number;
  patients: number;
  availability: string;
}

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
  imports: [NgIf, NgClass, RouterModule,CommonModule]
})
export class DoctorProfile {

  doctor: Doctor | undefined;

  doctorsList: Doctor[] = [
    { 
      id: 1, 
      name: 'Dr. Ahmed Ali', 
      specialty: 'Cardiology', 
      email: 'ahmed.ali@example.com', 
      phone: '01012345678', 
      photo: 'https://randomuser.me/api/portraits/men/34.jpg', 
      active: true, 
      state: 'Active', 
      bio: 'Experienced cardiologist with 10+ years of expertise in cardiovascular diseases, interventional cardiology, and preventive heart care.',
      experience: '12 years',
      education: 'MD Cardiology - Cairo University',
      languages: ['Arabic', 'English', 'French'],
      rating: 4.8,
      patients: 2450,
      availability: 'Mon, Wed, Fri: 9:00 AM - 5:00 PM'
    },
    { 
      id: 2, 
      name: 'Dr. Sara Hassan', 
      specialty: 'Dermatology', 
      email: 'sara.hassan@example.com', 
      phone: '01023456789', 
      photo: 'https://randomuser.me/api/portraits/women/43.jpg', 
      active: false, 
      state: 'Inactive', 
      bio: 'Dermatology expert specializing in skin diseases, cosmetic dermatology, and laser treatments with international training.',
      experience: '8 years',
      education: 'MD Dermatology - Alexandria University',
      languages: ['Arabic', 'English'],
      rating: 4.6,
      patients: 1800,
      availability: 'Tue, Thu, Sat: 10:00 AM - 6:00 PM'
    },
    { 
      id: 3, 
      name: 'Dr. Mohamed Farid', 
      specialty: 'Pediatrics', 
      email: 'mohamed.farid@example.com', 
      phone: '01034567890', 
      photo: 'https://randomuser.me/api/portraits/men/33.jpg', 
      active: true, 
      state: 'Active', 
      bio: 'Pediatric doctor with passion for children health, vaccination programs, and developmental pediatrics.',
      experience: '15 years',
      education: 'MD Pediatrics - Ain Shams University',
      languages: ['Arabic', 'English', 'German'],
      rating: 4.9,
      patients: 3200,
      availability: 'Mon-Fri: 8:00 AM - 4:00 PM'
    },
    { 
      id: 4, 
      name: 'Dr. Amina Khaled', 
      specialty: 'Neurology', 
      email: 'amina.khaled@example.com', 
      phone: '01045678901', 
      photo: 'https://randomuser.me/api/portraits/women/44.jpg', 
      active: true, 
      state: 'Active', 
      bio: 'Professional neurologist focusing on brain disorders, epilepsy, stroke management, and neurological rehabilitation.',
      experience: '11 years',
      education: 'MD Neurology - Kasr Al Ainy',
      languages: ['Arabic', 'English'],
      rating: 4.7,
      patients: 1950,
      availability: 'Sun, Tue, Thu: 9:00 AM - 3:00 PM'
    },
    { 
      id: 5, 
      name: 'Dr. Khaled Saeed', 
      specialty: 'Orthopedics', 
      email: 'khaled.saeed@example.com', 
      phone: '01056789012', 
      photo: 'https://randomuser.me/api/portraits/men/36.jpg', 
      active: false, 
      state: 'Inactive', 
      bio: 'Experienced orthopedic surgeon with 12+ years in joint replacement, sports injuries, and spinal surgeries.',
      experience: '12 years',
      education: 'MD Orthopedics - Al Azhar University',
      languages: ['Arabic', 'English', 'Spanish'],
      rating: 4.8,
      patients: 2750,
      availability: 'Mon, Wed, Fri: 8:00 AM - 2:00 PM'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctor = this.doctorsList.find(d => d.id === id);
  }

  toggleActive() {
    if (this.doctor) {
      this.doctor.active = !this.doctor.active;
      this.doctor.state = this.doctor.active ? 'Active' : 'Inactive';
    }
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getSpecialtyIcon(specialty: string): string {
    switch (specialty.toLowerCase()) {
      case 'cardiology': return 'fas fa-heartbeat';
      case 'dermatology': return 'fas fa-allergies';
      case 'neurology': return 'fas fa-brain';
      case 'pediatrics': return 'fas fa-baby';
      case 'orthopedics': return 'fas fa-bone';
      default: return 'fas fa-user-md';
    }
  }
}