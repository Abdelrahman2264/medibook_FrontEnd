import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

// Register Chart.js controllers
Chart.register(...registerables);
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { DoctorsService } from '../../services/doctors.service';
import { NursesService } from '../../services/nurses.service';
import { PatientsService } from '../../services/patients.service';
import { AdminsService } from '../../services/admins.service';
import { AppointmentsService } from '../../services/appointments.service';
import { FeedbacksService } from '../../services/feedbacks.service';
import { RoomsService } from '../../services/rooms.service';
import { RoleService } from '../../services/role.service';
import { Doctor } from '../../models/doctor.model';
import { Nurse } from '../../models/nurse.model';
import { Patient } from '../../models/patient.model';
import { Admin } from '../../models/admin.model';
import { Appointment } from '../../models/appointment.model';
import { Feedback } from '../../models/feedback.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Statistics
  totalDoctors: number = 0;
  totalNurses: number = 0;
  totalAdmins: number = 0;
  totalPatients: number = 0;
  totalAppointments: number = 0;
  totalFeedbacks: number = 0;
  averageRate: number = 0;

  // Data arrays
  doctors: Doctor[] = [];
  nurses: Nurse[] = [];
  patients: Patient[] = [];
  admins: Admin[] = [];
  appointments: Appointment[] = [];
  feedbacks: Feedback[] = [];
  rooms: Room[] = [];

  // Recent data
  recentAppointments: Appointment[] = [];
  recentFeedbacks: Feedback[] = [];

  // Top lists
  topDoctorsByAppointments: any[] = [];
  topDoctorsByRates: any[] = [];
  topNurses: any[] = [];
  topRooms: any[] = [];
  topPatients: any[] = [];

  // Recent actions
  recentActions: any[] = [];

  // Loading state
  isLoading: boolean = true;

  // Donut Charts Configuration
  public doctorsDonutChartData: ChartData<'doughnut'> = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4caf50', '#f44336'],
      borderWidth: 0
    }]
  };

  public nursesDonutChartData: ChartData<'doughnut'> = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#2196f3', '#f44336'],
      borderWidth: 0
    }]
  };

  public adminsDonutChartData: ChartData<'doughnut'> = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#ff9800', '#f44336'],
      borderWidth: 0
    }]
  };

  public patientsDonutChartData: ChartData<'doughnut'> = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#9c27b0', '#f44336'],
      borderWidth: 0
    }]
  };

  public donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar Chart - Appointments by Status
  public appointmentsBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Appointments',
      data: [],
      backgroundColor: '#0284c7',
      borderColor: '#0369a1',
      borderWidth: 1
    }]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Line Chart - Appointments Over Time
  public appointmentsLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Appointments',
      data: [],
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Pie Chart - Appointments by Doctor
  public appointmentsPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#0284c7', '#4caf50', '#ff9800', '#9c27b0', '#f44336',
        '#00bcd4', '#ffc107', '#795548', '#607d8b', '#e91e63'
      ]
    }]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 10,
          font: {
            size: 11
          }
        }
      }
    }
  };

  currentRole: string | null = null;
  currentUserId: number | null = null;
  currentDoctorId: number | null = null;

  constructor(
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private patientsService: PatientsService,
    private adminsService: AdminsService,
    private appointmentsService: AppointmentsService,
    private feedbacksService: FeedbacksService,
    private roomsService: RoomsService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Dashboard component initialized, isLoading:', this.isLoading);
    
    // Get current role and user ID
    this.currentRole = this.roleService.getCurrentRole();
    this.currentUserId = this.roleService.getCurrentUserId();
    this.currentDoctorId = this.roleService.getCurrentDoctorId();
    
    // Subscribe to role changes
    this.roleService.getCurrentRole$().subscribe(role => {
      this.currentRole = role;
    });
    
    this.roleService.getCurrentUserId$().subscribe(userId => {
      this.currentUserId = userId;
      // If doctor, load doctor ID
      if (this.currentRole === 'doctor' && userId) {
        this.doctorsService.getDoctorByUserId(userId).subscribe({
          next: (doctor) => {
            if (doctor && doctor.doctorId) {
              this.currentDoctorId = doctor.doctorId;
            }
          },
          error: (error) => {
            console.error('Error loading doctor ID:', error);
          }
        });
      }
    });
    
    this.roleService.getCurrentDoctorId$().subscribe(doctorId => {
      this.currentDoctorId = doctorId;
    });
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    console.log('🔄 Starting to load dashboard data...');
    
    // Load all data in parallel using forkJoin with error handling and timeout
    forkJoin({
      doctors: this.doctorsService.getAllDoctors().pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('❌ Error loading doctors:', error);
          return of([]);
        })
      ),
      nurses: this.nursesService.getAllNurses().pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading nurses:', error);
          return of([]);
        })
      ),
      patients: this.patientsService.getAllPatients().pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading patients:', error);
          return of([]);
        })
      ),
      admins: this.adminsService.getAllAdmins().pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading admins:', error);
          return of([]);
        })
      ),
      appointments: (this.currentRole === 'user' && this.currentUserId 
        ? this.appointmentsService.getAppointmentsByPatientId(this.currentUserId)
        : this.appointmentsService.getAllAppointments()
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading appointments:', error);
          return of([]);
        })
      ),
      feedbacks: (this.currentRole === 'user' && this.currentUserId 
        ? this.feedbacksService.getFeedbacksByPatient(this.currentUserId)
        : this.feedbacksService.getAllFeedbacks()
      ).pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading feedbacks:', error);
          return of([]);
        })
      ),
      rooms: this.roomsService.getAllRooms().pipe(
        timeout(10000),
        catchError(error => {
          console.error('❌ Error loading rooms:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        console.log('✅ Dashboard data loaded successfully:', {
          doctors: data.doctors?.length || 0,
          nurses: data.nurses?.length || 0,
          patients: data.patients?.length || 0,
          admins: data.admins?.length || 0,
          appointments: data.appointments?.length || 0,
          feedbacks: data.feedbacks?.length || 0,
          rooms: data.rooms?.length || 0
        });
        
        this.doctors = data.doctors || [];
        this.nurses = data.nurses || [];
        this.patients = data.patients || [];
        this.admins = data.admins || [];
        this.appointments = data.appointments || [];
        this.feedbacks = data.feedbacks || [];
        this.rooms = data.rooms || [];

        try {
          console.log('🔄 Calculating statistics...');
          this.calculateStatistics();
          console.log('🔄 Preparing recent data...');
          this.prepareRecentData();
          console.log('🔄 Preparing top lists...');
          this.prepareTopLists();
          console.log('🔄 Preparing charts...');
          this.prepareCharts();
          console.log('🔄 Preparing recent actions...');
          this.prepareRecentActions();
          console.log('✅ All processing complete');
        } catch (error) {
          console.error('❌ Error processing dashboard data:', error);
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        }
        
        // Use setTimeout to ensure change detection runs after all processing
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('✅ Dashboard loading complete - isLoading set to false, current value:', this.isLoading);
          // Double check after a brief moment
          setTimeout(() => {
            if (this.isLoading) {
              console.warn('⚠️ isLoading is still true, forcing to false');
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          }, 100);
        }, 0);
      },
      error: (error) => {
        console.error('❌ Fatal error loading dashboard data:', error);
        // Set empty arrays as fallback
        this.doctors = [];
        this.nurses = [];
        this.patients = [];
        this.admins = [];
        this.appointments = [];
        this.feedbacks = [];
        this.rooms = [];
        
        try {
          this.calculateStatistics();
        } catch (e) {
          console.error('❌ Error calculating statistics:', e);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('✅ Dashboard loading complete (with errors)');
      }
    });
  }

  calculateStatistics(): void {
    // Count totals
    this.totalDoctors = this.doctors.length;
    this.totalNurses = this.nurses.length;
    this.totalAdmins = this.admins.length;
    this.totalPatients = this.patients.length;
    this.totalAppointments = this.appointments.length;
    this.totalFeedbacks = this.feedbacks.length;

    // Calculate average rate
    if (this.feedbacks.length > 0) {
      const totalRate = this.feedbacks.reduce((sum, feedback) => sum + feedback.rate, 0);
      this.averageRate = totalRate / this.feedbacks.length;
    }

    // Update donut charts
    const activeDoctors = this.doctors.filter(d => d.isActive).length;
    const inactiveDoctors = this.totalDoctors - activeDoctors;
    this.doctorsDonutChartData.datasets[0].data = [activeDoctors, inactiveDoctors];

    const activeNurses = this.nurses.filter(n => n.isActive).length;
    const inactiveNurses = this.totalNurses - activeNurses;
    this.nursesDonutChartData.datasets[0].data = [activeNurses, inactiveNurses];

    const activeAdmins = this.admins.filter(a => a.isActive).length;
    const inactiveAdmins = this.totalAdmins - activeAdmins;
    this.adminsDonutChartData.datasets[0].data = [activeAdmins, inactiveAdmins];

    const activePatients = this.patients.filter(p => p.isActive).length;
    const inactivePatients = this.totalPatients - activePatients;
    this.patientsDonutChartData.datasets[0].data = [activePatients, inactivePatients];
  }

  prepareRecentData(): void {
    try {
      // Recent appointments (last 5)
      this.recentAppointments = [...this.appointments]
        .filter(apt => apt.appointmentDate) // Filter out invalid dates
        .sort((a, b) => {
          try {
            const dateA = new Date(a.appointmentDate).getTime();
            const dateB = new Date(b.appointmentDate).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA;
          } catch {
            return 0;
          }
        })
        .slice(0, 5);

      // Recent feedbacks (last 5)
      this.recentFeedbacks = [...this.feedbacks]
        .filter(fb => fb.feedbackDate) // Filter out invalid dates
        .sort((a, b) => {
          try {
            const dateA = new Date(a.feedbackDate).getTime();
            const dateB = new Date(b.feedbackDate).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA;
          } catch {
            return 0;
          }
        })
        .slice(0, 5);
    } catch (error) {
      console.error('Error in prepareRecentData:', error);
      this.recentAppointments = [];
      this.recentFeedbacks = [];
    }
  }

  prepareTopLists(): void {
    // Top doctors by appointments
    const doctorAppointmentCounts = new Map<number, { doctor: Doctor; count: number }>();
    this.appointments.forEach(apt => {
      if (apt.doctorId) {
        const doctor = this.doctors.find(d => d.doctorId === apt.doctorId);
        if (doctor) {
          const existing = doctorAppointmentCounts.get(apt.doctorId);
          if (existing) {
            existing.count++;
          } else {
            doctorAppointmentCounts.set(apt.doctorId, { doctor, count: 1 });
          }
        }
      }
    });
    this.topDoctorsByAppointments = Array.from(doctorAppointmentCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.doctor.fullName,
        specialization: item.doctor.specialization,
        count: item.count,
        id: item.doctor.doctorId
      }));

    // Top doctors by rates
    const doctorRates = new Map<number, { doctor: Doctor; rates: number[] }>();
    this.feedbacks.forEach(feedback => {
      if (feedback.doctorId) {
        const doctor = this.doctors.find(d => d.doctorId === feedback.doctorId);
        if (doctor) {
          const existing = doctorRates.get(feedback.doctorId);
          if (existing) {
            existing.rates.push(feedback.rate);
          } else {
            doctorRates.set(feedback.doctorId, { doctor, rates: [feedback.rate] });
          }
        }
      }
    });
    this.topDoctorsByRates = Array.from(doctorRates.values())
      .map(item => ({
        name: item.doctor.fullName,
        specialization: item.doctor.specialization,
        averageRate: item.rates.reduce((a, b) => a + b, 0) / item.rates.length,
        feedbackCount: item.rates.length,
        id: item.doctor.doctorId
      }))
      .sort((a, b) => b.averageRate - a.averageRate)
      .slice(0, 5);

    // Top nurses by appointments
    const nurseAppointmentCounts = new Map<number, { nurse: Nurse; count: number }>();
    this.appointments.forEach(apt => {
      if (apt.nurseId) {
        const nurse = this.nurses.find(n => n.nurseId === apt.nurseId);
        if (nurse) {
          const existing = nurseAppointmentCounts.get(apt.nurseId);
          if (existing) {
            existing.count++;
          } else {
            nurseAppointmentCounts.set(apt.nurseId, { nurse, count: 1 });
          }
        }
      }
    });
    this.topNurses = Array.from(nurseAppointmentCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.nurse.fullName,
        count: item.count,
        id: item.nurse.nurseId
      }));

    // Top rooms by appointments
    const roomAppointmentCounts = new Map<number, { room: Room; count: number }>();
    this.appointments.forEach(apt => {
      if (apt.roomId) {
        const room = this.rooms.find(r => r.roomId === apt.roomId);
        if (room) {
          const existing = roomAppointmentCounts.get(apt.roomId);
          if (existing) {
            existing.count++;
          } else {
            roomAppointmentCounts.set(apt.roomId, { room, count: 1 });
          }
        }
      }
    });
    this.topRooms = Array.from(roomAppointmentCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.room.roomName,
        type: item.room.roomType,
        count: item.count,
        id: item.room.roomId
      }));

    // Top patients by bookings
    const patientAppointmentCounts = new Map<number, { patient: Patient; count: number }>();
    this.appointments.forEach(apt => {
      if (apt.patientId) {
        const patient = this.patients.find(p => p.id === apt.patientId);
        if (patient) {
          const existing = patientAppointmentCounts.get(apt.patientId);
          if (existing) {
            existing.count++;
          } else {
            patientAppointmentCounts.set(apt.patientId, { patient, count: 1 });
          }
        }
      }
    });
    this.topPatients = Array.from(patientAppointmentCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        name: item.patient.fullName,
        count: item.count,
        id: item.patient.id
      }));
  }

  prepareCharts(): void {
    // Bar chart - Appointments by status
    const statusCounts = new Map<string, number>();
    this.appointments.forEach(apt => {
      const status = apt.status || 'Unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    this.appointmentsBarChartData.labels = Array.from(statusCounts.keys());
    this.appointmentsBarChartData.datasets[0].data = Array.from(statusCounts.values());

    // Line chart - Appointments over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const dayCounts = new Map<string, number>();
    last7Days.forEach(day => dayCounts.set(day, 0));
    this.appointments.forEach(apt => {
      if (apt.appointmentDate) {
        const date = new Date(apt.appointmentDate);
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dayCounts.has(dayKey)) {
          dayCounts.set(dayKey, (dayCounts.get(dayKey) || 0) + 1);
        }
      }
    });
    this.appointmentsLineChartData.labels = last7Days;
    this.appointmentsLineChartData.datasets[0].data = last7Days.map(day => dayCounts.get(day) || 0);

    // Pie chart - Top 5 doctors by appointments
    if (this.topDoctorsByAppointments.length > 0) {
      this.appointmentsPieChartData.labels = this.topDoctorsByAppointments.map(d => d.name);
      this.appointmentsPieChartData.datasets[0].data = this.topDoctorsByAppointments.map(d => d.count);
    }
  }

  prepareRecentActions(): void {
    this.recentActions = [];
    
    // Add recent appointments
    this.recentAppointments.slice(0, 3).forEach(apt => {
      this.recentActions.push({
        action: 'New Appointment',
        description: `${apt.patientName} with ${apt.doctorName}`,
        time: this.getTimeAgo(apt.appointmentDate),
        type: 'appointment',
        icon: 'fas fa-calendar-check',
        color: '#0284c7'
      });
    });

    // Add recent feedbacks
    this.recentFeedbacks.slice(0, 2).forEach(feedback => {
      this.recentActions.push({
        action: 'New Feedback',
        description: `${feedback.patientName} rated ${feedback.doctorName} (${feedback.rate}/5)`,
        time: this.getTimeAgo(feedback.feedbackDate),
        type: 'feedback',
        icon: 'fas fa-star',
        color: '#ff9800'
      });
    });

    // Sort by time (most recent first)
    this.recentActions.sort((a, b) => {
      // Simple sort - in real app, parse dates properly
      return 0;
    });
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatRate(rate: number): string {
    return rate.toFixed(1);
  }
}
