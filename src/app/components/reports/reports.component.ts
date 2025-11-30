import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  reports = [
    { id: 1, title: 'Monthly Patient Report', date: '2024-01-15', type: 'Patient', status: 'Generated' },
    { id: 2, title: 'Weekly Appointment Report', date: '2024-01-14', type: 'Appointment', status: 'Pending' },
    { id: 3, title: 'Quarterly Financial Report', date: '2024-01-10', type: 'Financial', status: 'Generated' },
    { id: 4, title: 'Daily Activity Report', date: '2024-01-16', type: 'Activity', status: 'In Progress' }
  ];
}










