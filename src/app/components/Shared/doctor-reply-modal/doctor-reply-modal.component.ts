import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorReplyDto, Feedback } from '../../../models/feedback.model';

@Component({
  selector: 'app-doctor-reply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-reply-modal.component.html',
  styleUrls: ['./doctor-reply-modal.component.css']
})
export class DoctorReplyModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() selectedFeedback: Feedback | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<DoctorReplyDto>();

  replyForm: {
    doctorReply: string;
  } = {
    doctorReply: ''
  };

  errorMessage: string = '';
  submitted = false;
  fieldErrors: {
    doctorReply?: string;
  } = {};

  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible && this.selectedFeedback) {
      this.initializeForm();
    }
  }

  initializeForm() {
    if (this.selectedFeedback && this.selectedFeedback.doctorReply) {
      this.replyForm = {
        doctorReply: this.selectedFeedback.doctorReply
      };
    } else {
      this.replyForm = {
        doctorReply: ''
      };
    }
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

    // Validate Doctor Reply
    if (!this.replyForm.doctorReply?.trim()) {
      if (this.submitted || this.touchedFields.has('doctorReply')) {
        this.fieldErrors.doctorReply = 'Doctor reply is required';
      }
      isValid = false;
    } else if (this.replyForm.doctorReply.trim().length < 1) {
      if (this.submitted || this.touchedFields.has('doctorReply')) {
        this.fieldErrors.doctorReply = 'Doctor reply must be at least 1 character long';
      }
      isValid = false;
    } else if (this.replyForm.doctorReply.trim().length > 500) {
      if (this.submitted || this.touchedFields.has('doctorReply')) {
        this.fieldErrors.doctorReply = 'Doctor reply must be less than 500 characters';
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

    if (!this.selectedFeedback) {
      this.errorMessage = 'Feedback information is missing';
      return;
    }

    const replyData: DoctorReplyDto = {
      feedbackId: this.selectedFeedback.feedbackId,
      doctorReply: this.replyForm.doctorReply.trim()
    };

    console.log('📝 Submitting doctor reply:', replyData);
    this.save.emit(replyData);
  }

  onClose() {
    this.close.emit();
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }
}



