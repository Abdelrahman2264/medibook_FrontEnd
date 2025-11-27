import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // 👈 مهم لـ *ngFor و *ngIf

@Component({
  selector: 'app-table',
    standalone: true,       // لازم لو الكومبوننت Standalone
  imports: [CommonModule], // 👈 هنا تضيف CommonModule
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  patient = {
    name: 'Meryem Khaled',
    age: 21,
    gender: 'Female'
  };

  // بيانات الحجوزات
  appointments = [
    { doctor: 'Dr. Ahmed', specialty: 'Cardiology', fee: '$50', day: '2025-11-25', time: '10:00 AM', session: 'Morning' },
    { doctor: 'Dr. Sara', specialty: 'Dental', fee: '$30', day: '2025-11-28', time: '2:00 PM', session: 'Afternoon' },
    { doctor: 'Dr. Ali', specialty: 'Dermatology', fee: '$40', day: '2025-12-01', time: '11:00 AM', session: 'Morning' }
  ];

  confirmMessage: string | null = null;  // الرسالة اللي تظهر للتأكيد
  appointmentToCancel: any = null;        // الحجز اللي عايزين نلغيه

  // استدعاء رسالة التأكيد
  showConfirm(appointment: any) {
    this.appointmentToCancel = appointment;
    this.confirmMessage = `Are you sure you want to cancel the appointment with ${appointment.doctor}?`;
  }

  // الضغط على "Yes" لتأكيد الإلغاء
  confirmCancel() {
    if (this.appointmentToCancel) {
      this.appointments = this.appointments.filter(a => a !== this.appointmentToCancel);
    }
    this.cancelConfirm();
  }

  // الضغط على "No" أو بعد الإلغاء لإخفاء الرسالة
  cancelConfirm() {
    this.confirmMessage = null;
    this.appointmentToCancel = null;
  }

}
