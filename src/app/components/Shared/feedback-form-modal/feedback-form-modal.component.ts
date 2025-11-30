import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateFeedbackDto } from '../../../models/feedback.model';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-feedback-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-form-modal.component.html',
  styleUrls: ['./feedback-form-modal.component.css']
})
export class FeedbackFormModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() appointment: Appointment | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateFeedbackDto>();

  feedbackForm: {
    comment: string;
    rate: number;
  } = {
    comment: '',
    rate: 5
  };

  errorMessage: string = '';

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible) {
      this.initializeForm();
    }
  }

  initializeForm() {
    this.feedbackForm = {
      comment: '',
      rate: 5
    };
    this.errorMessage = '';
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.feedbackForm.comment?.trim()) {
      this.errorMessage = 'Comment is required';
      return false;
    }

    if (this.feedbackForm.comment.trim().length < 1) {
      this.errorMessage = 'Comment must be at least 1 character long';
      return false;
    }

    if (this.feedbackForm.comment.trim().length > 500) {
      this.errorMessage = 'Comment must be less than 500 characters';
      return false;
    }

    if (this.feedbackForm.rate < 1 || this.feedbackForm.rate > 5) {
      this.errorMessage = 'Rate must be between 1 and 5';
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (!this.appointment) {
      this.errorMessage = 'Appointment information is missing';
      return;
    }

    const feedbackData: CreateFeedbackDto = {
      patientId: this.appointment.patientId,
      doctorId: this.appointment.doctorId,
      appointmentId: this.appointment.appointmentId,
      comment: this.feedbackForm.comment.trim(),
      rate: this.feedbackForm.rate
    };

    console.log('📝 Submitting feedback:', feedbackData);
    this.save.emit(feedbackData);
  }

  onClose() {
    this.close.emit();
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }

  setRate(rate: number) {
    this.feedbackForm.rate = rate;
  }
}



