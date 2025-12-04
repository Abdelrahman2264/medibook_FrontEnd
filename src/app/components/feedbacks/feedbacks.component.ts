import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbacksService } from '../../services/feedbacks.service';
import { Feedback, UpdateFeedbackDto, DoctorReplyDto } from '../../models/feedback.model';
import { FeedbackEditModalComponent } from '../Shared/feedback-edit-modal/feedback-edit-modal.component';
import { DoctorReplyModalComponent } from '../Shared/doctor-reply-modal/doctor-reply-modal.component';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';

// Define an interface extending the original Feedback model to include accordion state
interface ExpandedFeedback extends Feedback {
  isExpanded: boolean;
}

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [CommonModule, FormsModule, FeedbackEditModalComponent, DoctorReplyModalComponent, ConfirmationModalComponent],
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent implements OnInit {
  // استخدام الواجهة الموسعة الجديدة التي تتضمن isExpanded
  feedbacks: ExpandedFeedback[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal states
  showEditModal: boolean = false;
  showReplyModal: boolean = false;
  showConfirmationModal: boolean = false;
  // تحديث نوع المتغير
  selectedFeedback: ExpandedFeedback | null = null;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private feedbacksService: FeedbacksService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 FeedbacksComponent initialized');
    this.loadFeedbacks();
  }

  forceUpdate() {
    console.log('🔄 Force updating component...');
    this.cdr.detectChanges();
    console.log('✅ Force update completed');
  }

  loadFeedbacks() {
    console.log('🔄 Loading feedbacks...');
    this.isLoading = true;
    this.errorMessage = '';
    this.forceUpdate();

    this.feedbacksService.getAllFeedbacks().subscribe({
      next: (data: Feedback[]) => {
        console.log('✅ Feedbacks loaded:', data.length);
        // Map the fetched data to the extended type, initializing isExpanded to false
        this.feedbacks = data.map(feedback => ({
          ...feedback,
          isExpanded: false
        })) as ExpandedFeedback[];
        this.isLoading = false;
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading feedbacks:', error);
        this.errorMessage = 'Failed to load feedbacks. Please try again.';
        this.isLoading = false;
        this.forceUpdate();
      }
    });
  }

  /**
   * Toggles the expansion state of a feedback card (Accordion functionality).
   * @param feedback The feedback object to toggle.
   */
  toggleFeedbackDetails(feedback: ExpandedFeedback) {
    feedback.isExpanded = !feedback.isExpanded;
    this.forceUpdate();
    console.log(`👁️ Feedback ${feedback.feedbackId} expansion toggled: ${feedback.isExpanded}`);
  }


  openEditModal(feedback: ExpandedFeedback) {
    console.log('📝 Opening edit modal for feedback:', feedback.feedbackId);
    this.selectedFeedback = feedback;
    this.showEditModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openReplyModal(feedback: ExpandedFeedback) {
    console.log('💬 Opening reply modal for feedback:', feedback.feedbackId);
    this.selectedFeedback = feedback;
    this.showReplyModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  closeModals() {
    console.log('❌ Closing modals');
    this.showEditModal = false;
    this.showReplyModal = false;
    this.showConfirmationModal = false;
    this.selectedFeedback = null;
    this.forceUpdate();
  }

  onUpdateFeedback(updateData: UpdateFeedbackDto) {
    console.log('🔄 Updating feedback:', updateData);
    this.isLoading = true;
    this.forceUpdate();

    this.feedbacksService.updateFeedback(updateData).subscribe({
      next: (response: any) => {
        console.log('✅ Feedback updated successfully');
        this.loadFeedbacks();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error updating feedback:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to update feedback. Please try again.');
      }
    });
  }

  onAddDoctorReply(replyData: DoctorReplyDto) {
    console.log('🔄 Adding doctor reply:', replyData);
    this.isLoading = true;
    this.forceUpdate();

    this.feedbacksService.addDoctorReply(replyData).subscribe({
      next: (response: any) => {
        console.log('✅ Doctor reply added successfully');
        this.loadFeedbacks();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error adding doctor reply:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to add doctor reply. Please try again.');
      }
    });
  }

  onToggleFavourite(feedback: ExpandedFeedback) {
    console.log('⭐ Toggling favourite for feedback:', feedback.feedbackId);
    this.isLoading = true;
    this.forceUpdate();

    this.feedbacksService.toggleFavourite(feedback.feedbackId).subscribe({
      next: (response: any) => {
        console.log('✅ Favourite toggled successfully');
        this.loadFeedbacks();
      },
      error: (error: any) => {
        console.error('❌ Error toggling favourite:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to toggle favourite. Please try again.');
      }
    });
  }

  confirmDelete(feedback: ExpandedFeedback) {
    this.selectedFeedback = feedback;
    this.confirmationConfig = {
      title: 'Delete Feedback',
      message: `Are you sure you want to delete the feedback from <strong>${feedback.patientName}</strong>? This action cannot be undone.`,
      icon: 'fas fa-trash-alt',
      iconColor: '#dc3545',
      confirmText: 'Delete Feedback',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    };

    this.pendingAction = () => this.deleteFeedback(feedback);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  deleteFeedback(feedback: ExpandedFeedback) {
    console.log('🔄 Deleting feedback:', feedback.feedbackId);
    this.isLoading = true;
    this.forceUpdate();

    this.feedbacksService.deleteFeedback(feedback.feedbackId).subscribe({
      next: (response: any) => {
        console.log('✅ Feedback deleted successfully');
        this.loadFeedbacks();
        this.closeModals();
      },
      error: (error: any) => {
        console.error('❌ Error deleting feedback:', error);
        this.isLoading = false;
        this.forceUpdate();
        alert('Failed to delete feedback. Please try again.');
      }
    });
  }

  onConfirmAction() {
    console.log('✅ Confirmation confirmed');
    this.showConfirmationModal = false;
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.forceUpdate();
  }

  onCancelAction() {
    console.log('❌ Confirmation cancelled');
    this.showConfirmationModal = false;
    this.pendingAction = () => {};
    this.forceUpdate();
  }
}