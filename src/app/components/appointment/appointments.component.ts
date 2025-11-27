import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Doctor {
  name: string;
  specialty: string;
  rating: number;
  bio?: string;
  certificates?: string[];
  operations?: string[];
  availableDays?: string[];    // الأيام المتاحة للحجز (Mon, Tue...)
  availableTimes?: string[];   // المواعيد المتاحة لكل يوم
  price?: number;              // سعر الكشف
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {
  
  searchName = '';
  filterSpecialty = '';
  constructor(private router: Router) {}  // ← هنا

  doctors: Doctor[] = [
    { name: 'Dr. Ahmed Ali', specialty: 'General surgery', rating: 4, bio: '10 years experience', certificates: ['MBBS', 'MD Surgery'], operations: ['Appendectomy', 'Cholecystectomy'], availableDays: ['Mon', 'Wed', 'Fri'], availableTimes: ['10:00', '14:00'], price: 200 },
    { name: 'Dr. Sara Mohamed', specialty: 'Internal medicine', rating: 5, bio: '12 years experience', certificates: ['MBBS', 'MD Internal'], operations: ['Diabetes Management'], availableDays: ['Tue', 'Thu'], availableTimes: ['11:00', '15:00'], price: 250 },
    { name: 'Dr. Ali Hassan', specialty: 'Pediatrics', rating: 3, bio: '8 years experience', certificates: ['MBBS', 'Pediatrics Diploma'], operations: ['Vaccinations'], availableDays: ['Mon', 'Tue'], availableTimes: ['09:00', '13:00'], price: 180 },
    { name: 'Dr. Lina Farouk', specialty: 'Dermatology', rating: 5, bio: '9 years experience', certificates: ['MBBS', 'Dermatology Diploma'], operations: ['Skin Treatment'], availableDays: ['Wed', 'Fri'], availableTimes: ['12:00', '16:00'], price: 220 },
    { name: 'Dr. Omar Tarek', specialty: 'Cardiology', rating: 4, bio: '11 years experience', certificates: ['MBBS', 'Cardiology Diploma'], operations: ['Angioplasty'], availableDays: ['Mon', 'Thu'], availableTimes: ['10:00', '14:00'], price: 300 },
    { name: 'Dr. Mona Adel', specialty: 'Neurology', rating: 5, bio: '15 years experience', certificates: ['MBBS', 'Neurology Diploma'], operations: ['EEG Analysis'], availableDays: ['Tue', 'Fri'], availableTimes: ['11:00', '15:00'], price: 280 },
    { name: 'Dr. Khaled Fathy', specialty: 'Orthopedics', rating: 4, bio: '10 years experience', certificates: ['MBBS', 'Orthopedic Diploma'], operations: ['Joint Replacement'], availableDays: ['Wed', 'Thu'], availableTimes: ['09:00', '13:00'], price: 270 },
    { name: 'Dr. Yasmine Hossam', specialty: 'ENT', rating: 5, bio: '12 years experience', certificates: ['MBBS', 'ENT Diploma'], operations: ['Tonsillectomy'], availableDays: ['Mon', 'Tue'], availableTimes: ['10:00', '14:00'], price: 230 },
    { name: 'Dr. Samir Nabil', specialty: 'Urology', rating: 3, bio: '7 years experience', certificates: ['MBBS', 'Urology Diploma'], operations: ['Kidney Stone Removal'], availableDays: ['Wed', 'Fri'], availableTimes: ['09:00', '13:00'], price: 250 },
    { name: 'Dr. Reem Salah', specialty: 'Ophthalmology', rating: 4, bio: '9 years experience', certificates: ['MBBS', 'Ophthalmology Diploma'], operations: ['Cataract Surgery'], availableDays: ['Tue', 'Thu'], availableTimes: ['11:00', '15:00'], price: 210 },
    { name: 'Dr. Hany Said', specialty: 'Dentistry', rating: 5, bio: '8 years experience', certificates: ['BDS'], operations: ['Root Canal'], availableDays: ['Mon', 'Wed'], availableTimes: ['10:00', '14:00'], price: 200 },
    { name: 'Dr. Farah Mostafa', specialty: 'Psychiatry', rating: 4, bio: '10 years experience', certificates: ['MBBS', 'Psychiatry Diploma'], operations: ['Counseling'], availableDays: ['Tue', 'Thu'], availableTimes: ['12:00', '16:00'], price: 220 },
    { name: 'Dr. Tamer Helmy', specialty: 'Dermatology', rating: 5, bio: '11 years experience', certificates: ['MBBS', 'Dermatology Diploma'], operations: ['Laser Treatment'], availableDays: ['Mon', 'Fri'], availableTimes: ['10:00', '14:00'], price: 240 },
    { name: 'Dr. Dina Magdy', specialty: 'Internal medicine', rating: 4, bio: '9 years experience', certificates: ['MBBS', 'MD Internal'], operations: ['Hypertension Management'], availableDays: ['Wed', 'Thu'], availableTimes: ['11:00', '15:00'], price: 230 },
    { name: 'Dr. Ahmed Samir', specialty: 'Cardiology', rating: 5, bio: '13 years experience', certificates: ['MBBS', 'Cardiology Diploma'], operations: ['Angiography'], availableDays: ['Tue', 'Fri'], availableTimes: ['12:00', '16:00'], price: 300 },
  ];

  specialties = [
    'General surgery','Internal medicine','Pediatrics','Dermatology',
    'Cardiology','Neurology','Orthopedics','ENT','Urology',
    'Ophthalmology','Dentistry','Psychiatry'
  ];

  selectedDoctor: Doctor | null = null;  
  showBookingModal = false;
  showSuccessMessage = false;
  bookingDate: string | null = null;
  bookingTime: string | null = null;
  bookingDoctor: Doctor | null = null;  
  monthDates: { dayNumber: number, dayName: string, fullDate: string }[] = [];

  get filteredDoctors() {
    return this.doctors.filter(d =>
      d.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
      (this.filterSpecialty === '' || d.specialty === this.filterSpecialty)
    );
  }

  starsArray(n: number) {
    return Array.from({ length: 5 }).map((_, i) => i < n);
  }

  // فتح مودال التفاصيل
  openDetails(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.showBookingModal = false;
  }

  // فتح مودال الحجز
  openBooking(doctor: Doctor) {
    this.bookingDoctor = doctor;
    this.showBookingModal = true;
    this.showSuccessMessage = false;

    this.bookingDate = null;
    this.bookingTime = null;

    // لا تغلقي selectedDoctor عند فتح الحجز
    this.generateMonthDates();
  }

  // توليد أيام الشهر للتقويم
  generateMonthDates() {
    this.monthDates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
      const fullDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      this.monthDates.push({ dayNumber: i, dayName, fullDate });
    }
  }

  // تأكيد الحجز
   confirmBooking() {
    if (this.bookingDate && this.bookingTime) {
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.router.navigate(['/table']); // هنا يروح للصفحة الجديدة بعد 1.5 ثانية
      }, 1500);
    } else {
      alert('Please select a day and time!');
    }
  }

  // إغلاق مودال التفاصيل
  closeDetails() {
    this.selectedDoctor = null;
    this.showSuccessMessage = false;
  }

  // التحقق من الأيام المتاحة
  isDayAvailable(fullDate: string): boolean {
    const dayName = new Date(fullDate).toLocaleDateString('en-US', { weekday: 'short' });
    return this.bookingDoctor?.availableDays?.includes(dayName) ?? false;
  }

  // إغلاق مودال الحجز
  closeBooking() {
    this.showBookingModal = false;
    this.showSuccessMessage = false;
    this.bookingDate = null;
    this.bookingTime = null;
  }
}
