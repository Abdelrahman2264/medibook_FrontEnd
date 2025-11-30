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
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.replyForm.doctorReply?.trim()) {
      this.errorMessage = 'Doctor reply is required';
      return false;
    }

    if (this.replyForm.doctorReply.trim().length < 1) {
      this.errorMessage = 'Doctor reply must be at least 1 character long';
      return false;
    }

    if (this.replyForm.doctorReply.trim().length > 500) {
      this.errorMessage = 'Doctor reply must be less than 500 characters';
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



