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
  submitted = false;
  fieldErrors: {
    comment?: string;
    rate?: string;
  } = {};

  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

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
    this.submitted = false;
    this.clearAllFieldErrors();
    this.touchedFields.clear();
  }

  private clearAllFieldErrors() {
    this.fieldErrors = {};
  }

  // Helper to check if a field should show error
  shouldShowError(fieldName: keyof typeof this.fieldErrors): boolean {
    return this.submitted || this.touchedFields.has(fieldName);
  }

  // Mark a field as touched
  markFieldAsTouched(fieldName: keyof typeof this.fieldErrors): void {
    this.touchedFields.add(fieldName);
  }

  // Handle field input - clear error when user starts typing
  onFieldInput(fieldName: keyof typeof this.fieldErrors): void {
    // Clear error for this field when user starts typing
    if (this.fieldErrors[fieldName]) {
      this.fieldErrors[fieldName] = '';
    }
  }

  // Handle field blur - validate and mark as touched
  onFieldBlur(fieldName: keyof typeof this.fieldErrors): void {
    this.markFieldAsTouched(fieldName);
    // Re-validate the form to show errors for touched fields
    this.validateForm();
  }

  validateForm(): boolean {
    // Clear previous errors (but keep them if field was touched or form was submitted)
    const previousErrors = { ...this.fieldErrors };
    this.fieldErrors = {};
    let isValid = true;

    // Validate Comment
    if (!this.feedbackForm.comment?.trim()) {
      if (this.submitted || this.touchedFields.has('comment')) {
        this.fieldErrors.comment = 'Comment is required';
      }
      isValid = false;
    } else if (this.feedbackForm.comment.trim().length < 1) {
      if (this.submitted || this.touchedFields.has('comment')) {
        this.fieldErrors.comment = 'Comment must be at least 1 character long';
      }
      isValid = false;
    } else if (this.feedbackForm.comment.trim().length > 500) {
      if (this.submitted || this.touchedFields.has('comment')) {
        this.fieldErrors.comment = 'Comment must be less than 500 characters';
      }
      isValid = false;
    }

    // Validate Rate
    if (this.feedbackForm.rate < 1 || this.feedbackForm.rate > 5) {
      if (this.submitted || this.touchedFields.has('rate')) {
        this.fieldErrors.rate = 'Please select a rating';
      }
      isValid = false;
    }

    if (!isValid && this.submitted) {
      this.errorMessage = 'Please fix all validation errors before submitting';
    }

    return isValid;
  }

  isFormValid(): boolean {
    // Only perform full validation on fields that have been touched or when form is submitted
    if (!this.submitted && this.touchedFields.size === 0) {
      return false; // Form is not valid until user interacts with it
    }
    
    return this.validateForm();
  }

  onSubmit() {
    this.submitted = true;
    
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
    this.markFieldAsTouched('rate');
    this.onFieldInput('rate');
  }
}



