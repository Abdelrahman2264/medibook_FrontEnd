import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorsService } from '../../services/doctors.service';
import { AppointmentsService } from '../../services/appointments.service';
import { Doctor } from '../../models/doctor.model';
import { AvailableDateDto, CreateAppointmentDto } from '../../models/appointment.model';

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
  patientId: number = 1;
  
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔧 BookAppointmentComponent initialized');
    this.loadDoctors();
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
    alert(`Viewing profile for Dr. ${doctor.fullName}\nSpecialization: ${doctor.specialization}\nExperience: ${doctor.experienceYears} years`);
  }

  bookAppointment(doctor: Doctor) {
    console.log('Booking appointment for doctor:', doctor);
    this.selectedDoctor = doctor;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableDates = [];
    this.errorMessage = '';
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
        this.forceUpdate();
      },
      error: (error) => {
        console.error('❌ Error loading available dates:', error);
        this.errorMessage = 'Failed to load available dates';
        this.availableDates = [];
        this.availableDatesLoading = false;
        this.forceUpdate();
      }
    });
  }

  getAvailableSlotsForSelectedDate(): string[] {
    if (!this.selectedDate) return [];
    
    const selectedDateObj = this.availableDates.find(date => date.date === this.selectedDate);
    return selectedDateObj ? selectedDateObj.availableSlots : [];
  }

  confirmBooking() {
    if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
      alert('Please select a date and time');
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
        alert('Appointment booked successfully!');
        this.showBookingModal = false;
        this.bookingInProgress = false;
        this.forceUpdate();
        this.router.navigate(['/appointments']);
      },
      error: (error) => {
        console.error('❌ Error creating appointment:', error);
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