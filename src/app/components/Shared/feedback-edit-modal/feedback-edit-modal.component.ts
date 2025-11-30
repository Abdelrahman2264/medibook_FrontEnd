import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateFeedbackDto, Feedback } from '../../../models/feedback.model';

@Component({
  selector: 'app-feedback-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-edit-modal.component.html',
  styleUrls: ['./feedback-edit-modal.component.css']
})
export class FeedbackEditModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() selectedFeedback: Feedback | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UpdateFeedbackDto>();

  feedbackForm: {
    comment: string;
  } = {
    comment: ''
  };

  errorMessage: string = '';

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible && this.selectedFeedback) {
      this.initializeForm();
    }
  }

  initializeForm() {
    if (this.selectedFeedback) {
      this.feedbackForm = {
        comment: this.selectedFeedback.comment || ''
      };
    } else {
      this.feedbackForm = {
        comment: ''
      };
    }
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

    return true;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (!this.selectedFeedback) {
      this.errorMessage = 'Feedback information is missing';
      return;
    }

    const updateData: UpdateFeedbackDto = {
      feedbackId: this.selectedFeedback.feedbackId,
      comment: this.feedbackForm.comment.trim()
    };

    console.log('📝 Updating feedback:', updateData);
    this.save.emit(updateData);
  }

  onClose() {
    this.close.emit();
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }
}



