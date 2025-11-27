import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {

  name: string = '';
  email: string = '';
  phone: string = '';
  gender: string = '';
  dob: string = '';

  recommend: string = '';
  satisfactionItems: string[] = [
    'The overall quality of care received',
    'Communication & clarity of information provided',
    'Cleanliness & maintenance of hospital facilities',
    'Information provided for diagnosis and treatment.',
    'Efficiency of admission & discharge process'
  ];
  ratings: string[] = ['', '', '', '', ''];
  improveText: string = '';

  showPopup: boolean = false;

  submitFeedback() {
    if(this.name && this.email) {
      this.showPopup = true;

      setTimeout(() => {
        this.showPopup = false;
        this.resetForm();
      }, 5000);

      console.log('Patient Info:', {
        name: this.name,
        email: this.email,
        phone: this.phone,
        gender: this.gender,
        dob: this.dob
      });
      console.log('Recommendation:', this.recommend);
      console.log('Satisfaction Ratings:', this.ratings);
      console.log('Feedback Text:', this.improveText);
    } else {
      alert('Please fill at least Name and Email!');
    }
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.gender = '';
    this.dob = '';
    this.recommend = '';
    this.ratings = ['', '', '', '', ''];
    this.improveText = '';
  }
}
