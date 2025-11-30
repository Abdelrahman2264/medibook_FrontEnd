import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointment-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-details-modal.component.html',
  styleUrls: ['./appointment-details-modal.component.css']
})
export class AppointmentDetailsModalComponent {
  @Input() isVisible: boolean = false;
  @Input() appointment: Appointment | null = null;
  
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }
}



