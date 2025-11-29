import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent {
  lists = [
    { id: 1, name: 'Patient List', count: 1247, icon: 'fas fa-user-injured' },
    { id: 2, name: 'Doctor List', count: 45, icon: 'fas fa-user-md' },
    { id: 3, name: 'Appointment List', count: 156, icon: 'fas fa-calendar-check' },
    { id: 4, name: 'Room List', count: 32, icon: 'fas fa-door-open' }
  ];
}







