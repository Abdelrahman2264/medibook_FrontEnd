import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  stats = [
    { label: 'Total Patients', value: '1,247', icon: 'fas fa-user-injured', color: '#1e90ff', route: '/patients' },
    { label: 'Appointments', value: '156', icon: 'fas fa-calendar-check', color: '#28a745', route: '/appointments' },
    { label: 'Doctors', value: '45', icon: 'fas fa-user-md', color: '#ff6b6b', route: '/doctors' },
    { label: 'Rooms', value: '32', icon: 'fas fa-door-open', color: '#ffc107', route: '/rooms' }
  ];

  recentActivities = [
    { action: 'New Appointment', patient: 'Ahmed Mohamed', time: '2 hours ago', type: 'appointment' },
    { action: 'Patient Check-in', patient: 'Sara Ali', time: '4 hours ago', type: 'checkin' },
    { action: 'Report Generated', patient: 'Nour Hassan', time: 'Yesterday', type: 'report' },
    { action: 'Room Assigned', patient: 'Karim Samy', time: '2 days ago', type: 'room' }
  ];
}




