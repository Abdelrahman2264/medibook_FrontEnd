import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { AppointmentsService } from '../../services/appointments.service';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Doctor } from '../../models/doctor.model';
import { AvailableDateDto, CreateAppointmentDto } from '../../models/appointment.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  isPast: boolean;
  dateString: string;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  doctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  availableDates: AvailableDateDto[] = [];
  selectedDate: string = '';
  selectedTime: string = '';
  patientId: number | null = null;
  
  // Calendar properties
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  showBookingModal: boolean = false;
  doctorsLoading: boolean = false;
  availableDatesLoading: boolean = false;
  bookingInProgress: boolean = false;
  errorMessage: string = '';
  private readonly doctorPlaceholder = 'assets/images/doctor-placeholder.png';

  constructor(
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    console.log('🔧 BookAppointmentComponent initialized');
    this.loadCurrentPatientId();
    this.loadDoctors();
  }

  loadCurrentPatientId() {
    const userId = this.roleService.getCurrentUserId();
    
    if (userId) {
      this.patientId = userId;
      console.log('✅ Current patient ID loaded:', this.patientId);
    } else {
      const storedUser = this.authService.getCurrentUser();
      if (storedUser) {
        this.patientId = storedUser.id || storedUser.userId || null;
        console.log('✅ Patient ID loaded from auth service:', this.patientId);
      } else {
        console.error('❌ Could not get current patient ID');
        this.router.navigate(['/signin']);
      }
    }
  }

  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadDoctors() {
    this.doctorsLoading = true;
    this.errorMessage = '';
    this.forceUpdate();
    
    console.log('🔄 Loading active doctors...');
    this.doctorsService.getActiveDoctors().subscribe({
      next: (doctors) => {
        console.log('✅ Doctors loaded successfully:', doctors);
        this.doctors = doctors;
        this.doctorsLoading = false;
        this.forceUpdate();
      },
      error: (error) => {
        console.error('❌ Error loading doctors:', error);
        this.errorMessage = 'Failed to load doctors. Please try again.';
        this.doctors = [];
        this.doctorsLoading = false;
        this.forceUpdate();
      }
    });
  }

  getDoctorImageUrl(photoUrl: string | null | undefined): string {
    return photoUrl && photoUrl.trim() !== '' ? photoUrl : this.doctorPlaceholder;
  }

  handleDoctorImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.doctorPlaceholder) {
      img.src = this.doctorPlaceholder;
    }
  }

  viewDoctorProfile(doctor: Doctor) {
    console.log('View profile for:', doctor.fullName);
    this.router.navigate(['/doctors', doctor.doctorId]);
  }

  bookAppointment(doctor: Doctor) {
    console.log('Booking appointment for doctor:', doctor);
    this.selectedDoctor = doctor;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableDates = [];
    this.errorMessage = '';
    this.currentMonth = new Date(); // Reset to current month
    this.loadAvailableDates(doctor.doctorId);
    this.showBookingModal = true;
    this.forceUpdate();
  }

  loadAvailableDates(doctorId: number) {
    this.availableDatesLoading = true;
    this.forceUpdate();
    
    this.appointmentsService.getAvailableDates(doctorId).subscribe({
      next: (dates) => {
        console.log('✅ Available dates loaded:', dates);
        this.availableDates = dates;
        this.availableDatesLoading = false;
        this.generateCalendar();
        this.forceUpdate();
      },
      error: (error) => {
        console.error('❌ Error loading available dates:', error);
        this.errorMessage = 'Failed to load available dates';
        this.availableDates = [];
        this.availableDatesLoading = false;
        this.generateCalendar();
        this.forceUpdate();
      }
    });
  }

  // Calendar Methods - Current Month Only
  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month to show
    const startDay = firstDay.getDay();
    
    this.calendarDays = [];
    
    // Previous month days (only for grid layout)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = this.formatDate(date);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: false,
        isAvailable: false, // Previous month dates not available
        isPast: true, // Previous month dates are always past
        dateString
      });
    }
    
    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = this.formatDate(date);
      const isSelected = dateString === this.selectedDate;
      const isPast = date < today;
      
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected,
        isAvailable: this.isDateAvailable(date),
        isPast,
        dateString
      });
    }
    
    // Next month days (only for grid layout)
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = totalCells - this.calendarDays.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateString = this.formatDate(date);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: false,
        isAvailable: false, // Next month dates not available
        isPast: false, // Next month dates are future
        dateString
      });
    }
  }

  isDateAvailable(date: Date): boolean {
    if (this.isPastDate(date)) return false;
    
    const dateString = this.formatDate(date);
    return this.availableDates.some(availableDate => 
      availableDate.date === dateString && availableDate.availableSlots.length > 0
    );
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth || day.isPast || !day.isAvailable) return;
    
    this.selectedDate = day.dateString;
    this.selectedTime = '';
    this.generateCalendar(); // Refresh calendar to update selection
    this.forceUpdate();
  }

  // Since backend only provides current month, we disable month navigation
  // But keep the UI for consistency
  prevMonth() {
    // Show message that only current month is available
    this.toastService.info('Only current month dates are available for booking');
  }

  nextMonth() {
    // Show message that only current month is available
    this.toastService.info('Only current month dates are available for booking');
  }

  goToToday() {
    this.currentMonth = new Date();
    this.generateCalendar();
  }

  getCurrentMonthYear(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getAvailableSlotsForSelectedDate(): string[] {
    if (!this.selectedDate) return [];
    
    const selectedDateObj = this.availableDates.find(date => date.date === this.selectedDate);
    return selectedDateObj ? selectedDateObj.availableSlots : [];
  }

  selectTime(slot: string) {
    this.selectedTime = slot;
  }

  confirmBooking() {
    if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
      this.toastService.warning('Please select a date and time');
      return;
    }

    if (!this.patientId) {
      console.error('❌ Patient ID is not available');
      this.toastService.error('Unable to identify patient. Please log in again.');
      this.router.navigate(['/signin']);
      return;
    }

    const appointmentDateTime = `${this.selectedDate}T${this.selectedTime}:00`;

    const appointmentData: CreateAppointmentDto = {
      patientId: this.patientId,
      doctorId: this.selectedDoctor.doctorId,
      appointmentDate: appointmentDateTime
    };

    console.log('🔄 Creating appointment with data:', appointmentData);
    this.bookingInProgress = true;
    this.forceUpdate();
    
    this.appointmentsService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        console.log('✅ Appointment created successfully:', response);
        this.toastService.success('Appointment booked successfully!');
        this.showBookingModal = false;
        this.bookingInProgress = false;
        this.forceUpdate();
        this.router.navigate(['/appointments']);
      },
      error: (error) => {
        console.error('❌ Error creating appointment:', error);
        this.toastService.error(error.message || 'Failed to book appointment. Please try again.');
        this.errorMessage = 'Failed to book appointment. Please try again.';
        this.bookingInProgress = false;
        this.forceUpdate();
      }
    });
  }

  closeModal() {
    this.showBookingModal = false;
    this.selectedDoctor = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableDates = [];
    this.availableDatesLoading = false;
    this.bookingInProgress = false;
    this.forceUpdate();
  }
}