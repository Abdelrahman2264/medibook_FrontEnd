import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { RoomsService } from '../../services/rooms.service';
import { FeedbacksService } from '../../services/feedbacks.service';
import { RoleService } from '../../services/role.service';
import { Appointment, CreateAppointmentDto, CancelAppointmentDto, AssignAppointmentDto, CloseAppointmentDto } from '../../models/appointment.model';
import { Doctor } from '../../models/doctor.model';
import { CreateFeedbackDto, Feedback } from '../../models/feedback.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { FeedbackFormModalComponent } from '../Shared/feedback-form-modal/feedback-form-modal.component';
import { ToastService } from '../../services/toast.service';

// لتجنب الأخطاء في TypeScript، سنضيف خاصية isExpanded إلى نوع Appointment محليًا.
// هذه الطريقة تفترض أن واجهة Appointment الأصلية تسمح بالخصائص الإضافية.
// في حالة عدم السماح، يمكن استخدام (Appointment & { isExpanded: boolean })
// لكن للتبسيط والعملية، سنستخدم التعديل على مستوى الكائن في loadAppointments.

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, FeedbackFormModalComponent]
})
export class AppointmentsComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedDoctor: string = '';

  // تعديل نوع appointments ليكون مجرد قائمة من Appointment (مع إضافة isExpanded في loadAppointments)
  appointments: (Appointment & { isExpanded: boolean })[] = []; 
  doctors: Doctor[] = [];
  statuses: string[] = ['Pending', 'Scheduled', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];
  
  // Track which appointments have feedback
  appointmentsWithFeedback: Set<number> = new Set();
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showCancelModal: boolean = false;
  showCloseModal: boolean = false;
  showFeedbackModal: boolean = false;
  selectedAppointment: (Appointment & { isExpanded: boolean }) | null = null;
  cancelReason: string = '';
  closeNotes: string = '';
  closeMedicine: string = '';
  closeSubmitted = false;
  closeFieldErrors: {
    closeNotes?: string;
    closeMedicine?: string;
  } = {};
  closeTouchedFields: Set<string> = new Set();
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  // Role-based access
  currentRole: string | null = null;
  currentUserId: number | null = null;
  currentDoctorId: number | null = null;
  currentNurseId: number | null = null;
  isUser: boolean = false;
  isDoctor: boolean = false;
  isNurse: boolean = false;

  constructor(
    private appointmentsService: AppointmentsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private roomsService: RoomsService,
    private feedbacksService: FeedbacksService,
    private roleService: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    console.log('🔄 AppointmentsComponent initialized');
    
    // Get current role and user ID
    this.currentRole = this.roleService.getCurrentRole();
    this.currentUserId = this.roleService.getCurrentUserId();
    this.currentDoctorId = this.roleService.getCurrentDoctorId();
    this.currentNurseId = this.roleService.getCurrentNurseId();
    this.isUser = this.roleService.isUser();
    this.isDoctor = this.roleService.isDoctor();
    this.isNurse = this.roleService.isNurse();
    
    // Subscribe to role changes
    this.roleService.getCurrentRole$().subscribe(role => {
      this.currentRole = role;
      this.isUser = this.roleService.isUser();
      this.isDoctor = this.roleService.isDoctor();
      this.isNurse = this.roleService.isNurse();
    });
    
    this.roleService.getCurrentUserId$().subscribe(userId => {
      this.currentUserId = userId;
      // If doctor, load doctor ID
      if (this.isDoctor && userId) {
        this.doctorsService.getDoctorByUserId(userId).subscribe({
          next: (doctor) => {
            if (doctor && doctor.doctorId) {
              this.currentDoctorId = doctor.doctorId;
              this.loadAppointments(); // Reload appointments with doctor ID
            }
          },
          error: (error) => {
            console.error('Error loading doctor ID:', error);
          }
        });
      }
      // If nurse, load nurse ID
      if (this.isNurse && userId) {
        this.nursesService.getNurseByUserId(userId).subscribe({
          next: (nurse) => {
            if (nurse && nurse.nurseId) {
              this.currentNurseId = nurse.nurseId;
              this.loadAppointments(); // Reload appointments with nurse ID
            }
          },
          error: (error) => {
            console.error('Error loading nurse ID:', error);
          }
        });
      }
    });
    
    this.roleService.getCurrentDoctorId$().subscribe(doctorId => {
      this.currentDoctorId = doctorId;
    });
    
    this.roleService.getCurrentNurseId$().subscribe(nurseId => {
      this.currentNurseId = nurseId;
    });
    
    this.loadAppointments();
    this.loadDoctors();
    this.loadFeedbacks();
  }

  // Force update method
  forceUpdate() {
    console.log('🔄 Force updating component...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadAppointments() {
    console.log('🔄 Loading appointments...');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.forceUpdate();

    // If user role, load only their appointments
    // If doctor role, load only their appointments
    // If nurse role, load only their appointments (where they're involved)
    const request = (this.isUser && this.currentUserId) 
      ? this.appointmentsService.getAppointmentsByPatientId(this.currentUserId)
      : (this.isDoctor && this.currentDoctorId)
      ? this.appointmentsService.getAppointmentsByDoctorId(this.currentDoctorId)
      : (this.isNurse && this.currentNurseId)
      ? this.appointmentsService.getAppointmentsByNurseId(this.currentNurseId)
      : this.appointmentsService.getAllAppointments();

    request.subscribe({
      next: (data: Appointment[]) => {
        console.log('✅ Appointments loaded:', data.length);
        // تعيين isExpanded: false لكل موعد عند التحميل
        this.appointments = data.map(app => ({
          ...app,
          isExpanded: false // افتراضيًا، جميع البطاقات مغلقة
        })) as (Appointment & { isExpanded: boolean })[]; // التأكيد على النوع الجديد
        this.isLoading = false;
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading appointments:', error);
        this.errorMessage = 'Failed to load appointments. Please try again.';
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  loadDoctors() {
    this.doctorsService.getActiveDoctors().subscribe({
      next: (data: Doctor[]) => {
        console.log('✅ Doctors loaded for filtering:', data.length);
        this.doctors = data;
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading doctors:', error);
      }
    });
  }

  loadFeedbacks() {
    console.log('🔄 Loading feedbacks to check existing feedbacks...');
    
    // If user role, load only their feedbacks
    const request = (this.isUser && this.currentUserId)
      ? this.feedbacksService.getFeedbacksByPatient(this.currentUserId)
      : this.feedbacksService.getAllFeedbacks();
    
    request.subscribe({
      next: (feedbacks: Feedback[]) => {
        console.log('✅ Feedbacks loaded:', feedbacks.length);
        // Create a set of appointment IDs that have feedback
        this.appointmentsWithFeedback = new Set(
          feedbacks.map(feedback => feedback.appointmentId)
        );
        console.log('📊 Appointments with feedback:', Array.from(this.appointmentsWithFeedback));
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading feedbacks:', error);
        // Don't show error to user, just log it
      }
    });
  }

  hasFeedback(appointmentId: number): boolean {
    return this.appointmentsWithFeedback.has(appointmentId);
  }

  // دالة لتبديل حالة الفتح/الإغلاق
  toggleCard(appointment: (Appointment & { isExpanded: boolean })) {
    appointment.isExpanded = !appointment.isExpanded;
    this.forceUpdate();
  }
  
  // Modal functions
  openCancelModal(appointment: Appointment) {
    console.log('📝 Opening cancel modal for:', appointment.patientName);
    this.selectedAppointment = appointment as (Appointment & { isExpanded: boolean });
    this.cancelReason = '';
    this.showCancelModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openCloseModal(appointment: Appointment) {
    console.log('📝 Opening close modal for:', appointment.patientName);
    this.selectedAppointment = appointment as (Appointment & { isExpanded: boolean });
    this.closeNotes = '';
    this.closeMedicine = '';
    this.showCloseModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  closeModals() {
    console.log('❌ Closing modals');
    this.showCancelModal = false;
    this.showCloseModal = false;
    this.showFeedbackModal = false;
    this.selectedAppointment = null;
    this.cancelReason = '';
    this.closeNotes = '';
    this.closeMedicine = '';
    this.closeSubmitted = false;
    this.closeFieldErrors = {};
    this.closeTouchedFields.clear();
    this.forceUpdate();
  }

  openFeedbackModal(appointment: Appointment) {
    console.log('📝 Opening feedback modal for:', appointment.patientName);
    this.selectedAppointment = appointment as (Appointment & { isExpanded: boolean });
    this.showFeedbackModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  navigateToDetails(appointment: Appointment) {
    console.log('👁️ Navigating to appointment details:', appointment.appointmentId);
    this.router.navigate(['/appointment-details', appointment.appointmentId]);
  }

  // Action methods
  onCancelAppointment() {
    if (!this.selectedAppointment || !this.cancelReason.trim()) {
      this.toastService.warning('Please provide a cancellation reason.');
      return;
    }

    const cancelData: CancelAppointmentDto = {
      appointmentId: this.selectedAppointment.appointmentId,
      cancellationReason: this.cancelReason.trim()
    };

    console.log('🔄 Canceling appointment:', cancelData);
    this.isLoading = true;
    this.forceUpdate();

    this.appointmentsService.cancelAppointment(cancelData).subscribe({
      next: (response: any) => {
        console.log('✅ Appointment canceled successfully');
        this.loadAppointments();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error canceling appointment:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to cancel appointment. Please try again.');
      }
    });
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
    
    if (!this.selectedAppointment) {
      return;
    }

    if (!this.validateCloseForm()) {
      return;
    }

    const closeData: CloseAppointmentDto = {
      appointmentId: this.selectedAppointment.appointmentId,
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
        this.loadAppointments();
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

  // Navigation methods
  navigateToBookAppointment() {
    console.log('📅 Navigating to book appointment');
    this.router.navigate(['/book-appointment']);
  }

  navigateToAssign(appointment: Appointment) {
    console.log('👥 Navigating to assign appointment:', appointment.appointmentId);
    this.router.navigate(['/assign-appointment', appointment.appointmentId]);
  }

  // UI Helper Methods
  getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'scheduled':
      case 'confirmed':
        return 'fas fa-calendar-check';
      case 'pending':
        return 'fas fa-clock';
      case 'assigned':
        return 'fas fa-user-md';
      case 'in progress':
        return 'fas fa-procedures';
      case 'completed':
      case 'closed':
        return 'fas fa-check-circle';
      case 'cancelled':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-calendar';
    }
  }

  getCardColor(status: string, index: number): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'cancelled') return 'var(--bg-red-opacity-20)';
    if (statusLower === 'completed') return 'var(--bg-green-opacity-20)';
    if (statusLower === 'in progress') return 'var(--bg-warning-opacity-20)';
    return index % 2 === 0 ? 'var(--bg-blue-opacity-20)' : 'var(--bg-blue-opacity-20)';
  }

  filteredAppointments(): (Appointment & { isExpanded: boolean })[] { // تعديل نوع الإرجاع
    const filtered = this.appointments
      .filter(a => a.patientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                  a.doctorName?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .filter(a => !this.selectedStatus || a.status === this.selectedStatus)
      .filter(a => !this.selectedDoctor || a.doctorName === this.selectedDoctor);
    
    console.log('🔍 Filtered appointments:', filtered.length);
    return filtered;
  }

  // Confirmation for actions
  confirmCancel(appointment: Appointment) {
    this.confirmationConfig = {
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel the appointment for <strong>${appointment.patientName}</strong> with Dr. ${appointment.doctorName}?`,
      icon: 'fas fa-times-circle',
      iconColor: '#dc3545',
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep Appointment',
      confirmButtonClass: 'btn-danger'
    };

    this.pendingAction = () => this.openCancelModal(appointment);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  confirmClose(appointment: Appointment) {
    this.confirmationConfig = {
      title: 'Close Appointment',
      message: `Are you sure you want to close the appointment for <strong>${appointment.patientName}</strong>? This will mark it as completed.`,
      icon: 'fas fa-check-circle',
      iconColor: '#28a745',
      confirmText: 'Close Appointment',
      cancelText: 'Keep Open',
      confirmButtonClass: 'btn-success'
    };

    this.pendingAction = () => this.openCloseModal(appointment);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  // Confirmation modal handlers
  onConfirmAction() {
    console.log('✅ Confirmation confirmed');
    this.showConfirmationModal = false;
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.forceUpdate();
  }

  onCancelAction() {
    console.log('❌ Confirmation cancelled');
    this.showConfirmationModal = false;
    this.pendingAction = () => {};
    this.forceUpdate();
  }

  // Stats and Utilities
  countByStatus(status: string): number {
    const count = this.appointments.filter(a => a.status === status).length;
    console.log(`📊 ${status} appointments count:`, count);
    return count;
  }

  countPending(): number {
    return this.countByStatus('Pending');
  }

  countScheduled(): number {
    return this.countByStatus('Scheduled');
  }

  countInProgress(): number {
    return this.countByStatus('In Progress');
  }

  countCompleted(): number {
    return this.countByStatus('Completed');
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedDoctor = '';
    this.forceUpdate();
  }

  onCreateFeedback(feedbackData: CreateFeedbackDto) {
    console.log('🔄 Creating feedback:', feedbackData);
    this.isLoading = true;
    this.forceUpdate();

    this.feedbacksService.createFeedback(feedbackData).subscribe({
      next: (response: any) => {
        console.log('✅ Feedback created successfully');
        // Add the appointment ID to the set of appointments with feedback
        this.appointmentsWithFeedback.add(feedbackData.appointmentId);
        this.isLoading = false;
        this.closeModals();
        this.toastService.success('Feedback submitted successfully!');
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error creating feedback:', error);
        this.isLoading = false;
        this.forceUpdate();
        this.toastService.error('Failed to submit feedback. Please try again.');
      }
    });
  }

  // Debug method
  debugState() {
    console.log('🔍 Current Appointments Component State:', {
      isLoading: this.isLoading,
      appointmentsCount: this.appointments.length,
      filteredCount: this.filteredAppointments().length,
      showCancelModal: this.showCancelModal,
      showCloseModal: this.showCloseModal,
      showConfirmationModal: this.showConfirmationModal,
      searchTerm: this.searchTerm,
      selectedStatus: this.selectedStatus,
      selectedDoctor: this.selectedDoctor
    });
    this.forceUpdate();
  }
}