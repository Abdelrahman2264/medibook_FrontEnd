import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NursesService } from '../../services/nurses.service';
import { RoomsService } from '../../services/rooms.service';
import { AppointmentsService } from '../../services/appointments.service';
import { Nurse } from '../../models/nurse.model';
import { Room } from '../../models/room.model';
import { AssignAppointmentDto } from '../../models/appointment.model';

@Component({
  selector: 'app-assign-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-appointment.component.html',
  styleUrls: ['./assign-appointment.component.css']
})
export class AssignAppointmentComponent implements OnInit {
  appointmentId: number = 0;
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.appointmentId = +this.route.snapshot.paramMap.get('id')!;
    this.loadNurses();
    this.loadRooms();
  }

  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadNurses() {
    this.nursesLoading = true;
    this.errorMessage = '';
    this.forceUpdate();
    
    this.nursesService.getActiveNurses().subscribe({
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
    
    this.roomsService.getAllActiveRooms().subscribe({
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
      alert('Please select both a nurse and a room');
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
        alert('Appointment assigned successfully!');
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