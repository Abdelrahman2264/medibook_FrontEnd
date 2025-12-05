import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { RoomsService } from '../../services/rooms.service';
import { FeedbacksService } from '../../services/feedbacks.service';
import { PatientsService } from '../../services/patients.service';
import { Appointment, CloseAppointmentDto } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';
import { Nurse } from '../../models/nurse.model';
import { Room } from '../../models/room.model';
import { Feedback } from '../../models/feedback.model';
import { Patient } from '../../models/patient.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.css']
})
export class AppointmentDetailsComponent implements OnInit {
  appointmentId: number = 0;
  appointment: Appointment | null = null;
  patient: Patient | null = null;
  doctor: Doctor | null = null;
  nurse: Nurse | null = null;
  room: Room | null = null;
  feedback: Feedback | null = null;
  
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Close appointment modal states
  showCloseModal: boolean = false;
  showConfirmationModal: boolean = false;
  closeNotes: string = '';
  closeMedicine: string = '';
  closeSubmitted = false;
  closeFieldErrors: {
    closeNotes?: string;
    closeMedicine?: string;
  } = {};
  closeTouchedFields: Set<string> = new Set();
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private roomsService: RoomsService,
    private feedbacksService: FeedbacksService,
    private patientsService: PatientsService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    console.log('🔄 AppointmentDetailsComponent initialized');
    this.route.params.subscribe(params => {
      this.appointmentId = +params['id'];
      if (this.appointmentId) {
        this.loadAppointmentDetails();
      } else {
        this.errorMessage = 'Invalid appointment ID';
      }
    });
  }

  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadAppointmentDetails() {
    console.log('🔄 Loading appointment details for ID:', this.appointmentId);
    this.isLoading = true;
    this.errorMessage = '';
    this.forceUpdate();

    this.appointmentsService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment: Appointment) => {
        console.log('✅ Appointment loaded:', appointment);
        this.appointment = appointment;
        this.loadRelatedData();
      },
      error: (error: any) => {
        console.error('❌ Error loading appointment:', error);
        this.errorMessage = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  loadRelatedData() {
    if (!this.appointment) return;

    // Load patient details
    if (this.appointment.patientId) {
      this.patientsService.getPatientById(this.appointment.patientId).subscribe({
        next: (patient: Patient) => {
          console.log('✅ Patient loaded:', patient);
          this.patient = patient;
          this.forceUpdate();
        },
        error: (error: any) => {
          console.error('❌ Error loading patient:', error);
        }
      });
    }

    // Load doctor details
    if (this.appointment.doctorId) {
      this.doctorsService.getDoctorById(this.appointment.doctorId).subscribe({
        next: (doctor: Doctor) => {
          console.log('✅ Doctor loaded:', doctor);
          this.doctor = doctor;
          this.forceUpdate();
        },
        error: (error: any) => {
          console.error('❌ Error loading doctor:', error);
        }
      });
    }

    // Load nurse details
    if (this.appointment.nurseId) {
      this.nursesService.getNurseById(this.appointment.nurseId).subscribe({
        next: (nurse: Nurse) => {
          console.log('✅ Nurse loaded:', nurse);
          this.nurse = nurse;
          this.forceUpdate();
        },
        error: (error: any) => {
          console.error('❌ Error loading nurse:', error);
        }
      });
    }

    // Load room details
    if (this.appointment.roomId) {
      this.roomsService.getRoomById(this.appointment.roomId).subscribe({
        next: (room: Room) => {
          console.log('✅ Room loaded:', room);
          this.room = room;
          this.forceUpdate();
        },
        error: (error: any) => {
          console.error('❌ Error loading room:', error);
        }
      });
    }

    // Load feedback for this appointment
    this.feedbacksService.getAllFeedbacks().subscribe({
      next: (feedbacks: Feedback[]) => {
        console.log('✅ Feedbacks loaded:', feedbacks.length);
        const appointmentFeedback = feedbacks.find(f => f.appointmentId === this.appointmentId);
        if (appointmentFeedback) {
          console.log('✅ Feedback found for appointment:', appointmentFeedback);
          this.feedback = appointmentFeedback;
        }
        this.isLoading = false;
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading feedbacks:', error);
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  goBack() {
    this.router.navigate(['/appointments']);
  }

  confirmClose() {
    if (!this.appointment) return;

    this.confirmationConfig = {
      title: 'Close Appointment',
      message: `Are you sure you want to close the appointment for <strong>${this.appointment.patientName}</strong>? This will mark it as completed.`,
      icon: 'fas fa-check-circle',
      iconColor: '#28a745',
      confirmText: 'Close Appointment',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-success'
    };

    this.pendingAction = () => this.openCloseModal();
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  openCloseModal() {
    if (!this.appointment) return;
    this.closeNotes = '';
    this.closeMedicine = '';
    this.showCloseModal = true;
    this.forceUpdate();
  }

  closeModals() {
    this.showCloseModal = false;
    this.showConfirmationModal = false;
    this.closeNotes = '';
    this.closeMedicine = '';
    this.closeSubmitted = false;
    this.closeFieldErrors = {};
    this.closeTouchedFields.clear();
    this.forceUpdate();
  }

  validateCloseForm(): boolean {
    this.closeFieldErrors = {};
    let isValid = true;

    // Validate Medicine (required)
    if (!this.closeMedicine?.trim()) {
      if (this.closeSubmitted || this.closeTouchedFields.has('closeMedicine')) {
        this.closeFieldErrors.closeMedicine = 'Medicine Prescribed is required';
      }
      isValid = false;
    } else if (this.closeMedicine.trim().length > 1000) {
      if (this.closeSubmitted || this.closeTouchedFields.has('closeMedicine')) {
        this.closeFieldErrors.closeMedicine = 'Medicine must not exceed 1000 characters';
      }
      isValid = false;
    }

    // Validate Notes (required)
    if (!this.closeNotes?.trim()) {
      if (this.closeSubmitted || this.closeTouchedFields.has('closeNotes')) {
        this.closeFieldErrors.closeNotes = 'Treatment Notes is required';
      }
      isValid = false;
    } else if (this.closeNotes.trim().length > 2000) {
      if (this.closeSubmitted || this.closeTouchedFields.has('closeNotes')) {
        this.closeFieldErrors.closeNotes = 'Treatment Notes must not exceed 2000 characters';
      }
      isValid = false;
    }

    return isValid;
  }

  shouldShowCloseError(fieldName: keyof typeof this.closeFieldErrors): boolean {
    return this.closeSubmitted || this.closeTouchedFields.has(fieldName);
  }

  markCloseFieldAsTouched(fieldName: keyof typeof this.closeFieldErrors): void {
    this.closeTouchedFields.add(fieldName);
  }

  onCloseFieldInput(fieldName: keyof typeof this.closeFieldErrors): void {
    if (this.closeFieldErrors[fieldName]) {
      this.closeFieldErrors[fieldName] = '';
    }
  }

  onCloseFieldBlur(fieldName: keyof typeof this.closeFieldErrors): void {
    this.markCloseFieldAsTouched(fieldName);
    this.validateCloseForm();
  }

  onCloseAppointment() {
    this.closeSubmitted = true;
    
    if (!this.appointment) {
      return;
    }

    if (!this.validateCloseForm()) {
      return;
    }

    const closeData: CloseAppointmentDto = {
      appointmentId: this.appointment.appointmentId,
      notes: this.closeNotes.trim(),
      medicine: this.closeMedicine.trim()
    };

    console.log('🔄 Closing appointment:', closeData);
    this.isLoading = true;
    this.forceUpdate();

    this.appointmentsService.closeAppointment(closeData).subscribe({
      next: (response: any) => {
        console.log('✅ Appointment closed successfully');
        this.toastService.success('Appointment closed successfully');
        this.loadAppointmentDetails(); // Reload to get updated status
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error closing appointment:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to close appointment. Please try again.');
      }
    });
  }

  onConfirmAction() {
    this.showConfirmationModal = false;
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.forceUpdate();
  }

  onCancelAction() {
    this.showConfirmationModal = false;
    this.pendingAction = () => {};
    this.forceUpdate();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
}

