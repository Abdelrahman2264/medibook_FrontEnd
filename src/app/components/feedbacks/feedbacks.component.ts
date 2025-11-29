import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent {
  feedbacks = [
    { id: 1, patient: 'Ahmed Mohamed', rating: 5, comment: 'Excellent service and care!', date: '2024-01-15' },
    { id: 2, patient: 'Sara Ali', rating: 4, comment: 'Very professional staff.', date: '2024-01-14' },
    { id: 3, patient: 'Nour Hassan', rating: 5, comment: 'Great experience overall.', date: '2024-01-13' },
    { id: 4, patient: 'Karim Samy', rating: 3, comment: 'Good but could be improved.', date: '2024-01-12' }
  ];
}







