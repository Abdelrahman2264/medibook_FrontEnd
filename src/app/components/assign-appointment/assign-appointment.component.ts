import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NursesService } from '../../services/nurses.service';
import { RoomsService } from '../../services/rooms.service';
import { AppointmentsService } from '../../services/appointments.service';
import { Nurse } from '../../models/nurse.model';
import { Room } from '../../models/room.model';
import { AssignAppointmentDto, Appointment } from '../../models/appointment.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-assign-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-appointment.component.html',
  styleUrls: ['./assign-appointment.component.css']
})
export class AssignAppointmentComponent implements OnInit {
  appointmentId: number = 0;
  appointmentDate: Date | null = null;
  nurses: Nurse[] = [];
  rooms: Room[] = [];
  selectedNurseId: number | null = null;
  selectedRoomId: number | null = null;
  
  isLoading: boolean = false;
  nursesLoading: boolean = false;
  roomsLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nursesService: NursesService,
    private roomsService: RoomsService,
    private appointmentsService: AppointmentsService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.appointmentId = +this.route.snapshot.paramMap.get('id')!;
    this.loadAppointmentDetails();
  }

  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadAppointmentDetails() {
    this.isLoading = true;
    this.errorMessage = '';
    this.forceUpdate();

    this.appointmentsService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        console.log('✅ Appointment loaded:', appointment);
        
        // Parse the appointment date
        if (appointment.appointmentDate) {
          this.appointmentDate = new Date(appointment.appointmentDate);
          console.log('📅 Appointment date:', this.appointmentDate);
        } else {
          console.warn('⚠️ No appointment date found, loading all active nurses and rooms');
        }
        
        // Load nurses and rooms with the appointment date
        this.loadNurses();
        this.loadRooms();
        this.isLoading = false;
        this.forceUpdate();
      },
      error: (error) => {
        console.error('❌ Error loading appointment:', error);
        this.errorMessage = 'Failed to load appointment details. Please try again.';
        this.isLoading = false;
        // Still try to load nurses and rooms without date filter
        this.loadNurses();
        this.loadRooms();
        this.forceUpdate();
      }
    });
  }

  loadNurses() {
    this.nursesLoading = true;
    this.errorMessage = '';
    this.forceUpdate();
    
    const request = this.appointmentDate 
      ? this.nursesService.getActiveNurses(this.appointmentDate)
      : this.nursesService.getActiveNurses();
    
    request.subscribe({
      next: (nurses) => {
        console.log('✅ Active nurses loaded for assignment:', nurses);
        this.nurses = nurses; // already mapped in service, same as Nurses page
        this.nursesLoading = false;
        this.forceUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load nurses. Please try again.';
        this.nursesLoading = false;
        this.nurses = [];
        this.forceUpdate();
      }
    });
  }

  loadRooms() {
    this.roomsLoading = true;
    this.forceUpdate();
    
    const request = this.appointmentDate 
      ? this.roomsService.getAllActiveRooms(this.appointmentDate)
      : this.roomsService.getAllActiveRooms();
    
    request.subscribe({
      next: (rooms) => {
        console.log('✅ Active rooms loaded for assignment:', rooms);
        this.rooms = rooms;
        this.roomsLoading = false;
        this.forceUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load rooms. Please try again.';
        this.roomsLoading = false;
        this.rooms = [];
        this.forceUpdate();
      }
    });
  }

  selectNurse(nurseId: number) {
    this.selectedNurseId = nurseId;
    this.forceUpdate();
  }

  selectRoom(roomId: number) {
    this.selectedRoomId = roomId;
    this.forceUpdate();
  }

  confirmAssignment() {
    if (!this.selectedNurseId || !this.selectedRoomId) {
      this.toastService.warning('Please select both a nurse and a room');
      return;
    }

    const assignData: AssignAppointmentDto = {
      appointmentId: this.appointmentId,
      nurseId: this.selectedNurseId,
      roomId: this.selectedRoomId
    };

    this.isLoading = true;
    this.forceUpdate();
    
    this.appointmentsService.assignAppointment(assignData).subscribe({
      next: (response) => {
        this.toastService.success('Appointment assigned successfully!');
        this.router.navigate(['/appointments']);
      },
      error: (error) => {
        this.errorMessage = 'Failed to assign appointment. Please try again.';
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  cancel() {
    this.router.navigate(['/appointments']);
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}