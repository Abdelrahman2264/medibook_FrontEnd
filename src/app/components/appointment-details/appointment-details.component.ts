import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointment.model';
import { PatientsService } from '../../services/patients.service';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { RoomsService } from '../../services/rooms.service';
import { Patient } from '../../models/patient.model';
import { Doctor } from '../../models/doctor.model';
import { Nurse } from '../../models/nurse.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-details.component.html',
  styleUrls: ['./appointment-details.component.css']
})
export class AppointmentDetailsComponent implements OnInit {
  appointment: Appointment | null = null;
  patient: Patient | null = null;
  doctor: Doctor | null = null;
  nurse: Nurse | null = null;
  room: Room | null = null;

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: AppointmentsService,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private roomsService: RoomsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;

    if (!id) {
      this.errorMessage = 'Invalid appointment id.';
      return;
    }

    this.loadAppointment(id);
  }

  private forceUpdate() {
    this.cdr.detectChanges();
  }

  loadAppointment(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.forceUpdate();

    this.appointmentsService.getAppointmentById(id).subscribe({
      next: (appt) => {
        this.appointment = appt;

        // Load related entities with their full DTO details
        this.loadRelatedDetails();
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Failed to load appointment details.';
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  private loadRelatedDetails(): void {
    if (!this.appointment) {
      return;
    }

    const appt = this.appointment;

    // Track when all loads are done
    let pending = 0;
    const done = () => {
      pending--;
      if (pending <= 0) {
        this.isLoading = false;
        this.forceUpdate();
      }
    };

    // Patient
    if (appt.patientId) {
      pending++;
      this.patientsService.getPatientById(appt.patientId).subscribe({
        next: p => { this.patient = p; done(); },
        error: () => { done(); }
      });
    }

    // Doctor
    if (appt.doctorId) {
      pending++;
      this.doctorsService.getDoctorById(appt.doctorId).subscribe({
        next: d => { this.doctor = d; done(); },
        error: () => { done(); }
      });
    }

    // Nurse (optional)
    if (appt.nurseId) {
      pending++;
      this.nursesService.getNurseById(appt.nurseId).subscribe({
        next: n => { this.nurse = n; done(); },
        error: () => { done(); }
      });
    }

    // Room (optional)
    if (appt.roomId) {
      pending++;
      this.roomsService.getRoomById(appt.roomId).subscribe({
        next: r => { this.room = r; done(); },
        error: () => { done(); }
      });
    }

    // If nothing to load, stop loading state
    if (pending === 0) {
      this.isLoading = false;
      this.forceUpdate();
    }
  }

  goBack(): void {
    this.router.navigate(['/appointments']);
  }
}


