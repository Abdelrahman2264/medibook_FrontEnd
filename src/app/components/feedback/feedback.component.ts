import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

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
  fieldErrors: {
    name?: string;
    email?: string;
  } = {};

  constructor(private toastService: ToastService) {}

  validateForm(): boolean {
    this.fieldErrors = {};
    let isValid = true;

    if (!this.name?.trim()) {
      this.fieldErrors.name = 'Name is required';
      isValid = false;
    }

    if (!this.email?.trim()) {
      this.fieldErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email.trim())) {
        this.fieldErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    return isValid;
  }

  submitFeedback() {
    if (!this.validateForm()) {
      this.toastService.warning('Please fill in all required fields correctly');
      return;
    }

    this.showPopup = true;
    this.toastService.success('Feedback submitted successfully!');

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
