import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room, CreateRoomDto, UpdateRoomDto } from '../../../models/room.model';
import { RoomsService } from '../../../services/rooms.service';

@Component({
  selector: 'app-room-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-form-modal.component.html',
  styleUrls: ['./room-form-modal.component.css']
})
export class RoomFormModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() selectedRoom: Room | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateRoomDto | UpdateRoomDto>();

  roomForm: {
    roomName: string;
    roomType: string;
  } = {
    roomName: '',
    roomType: ''
  };

  roomTypes: string[] = [
    'Single Room',
    'Double Room',
    'Suite Room',
    'ICU Room',
    'Operation Room',
    'Emergency Room',
    'Maternity Room',
    'Pediatric Room'
  ];

  errorMessage: string = '';
  submitted = false;
  fieldErrors: {
    roomName?: string;
    roomType?: string;
  } = {};

  // Track which fields have been touched
  touchedFields: Set<string> = new Set();

  // Validation flags
  isRoomValidating: boolean = false;
  roomExists: boolean = false;

  constructor(private roomsService: RoomsService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // When modal becomes visible or selectedRoom changes, reinitialize form
    if (changes['isVisible'] && this.isVisible) {
      console.log('🔓 Modal opened - initializing form');
      setTimeout(() => {
        this.initializeForm();
      }, 100);
    }
    
    if (changes['selectedRoom'] && this.isVisible && this.isEditMode) {
      console.log('🔄 Selected room changed - updating form');
      setTimeout(() => {
        this.initializeForm();
      }, 50);
    }
    
    if (changes['isEditMode'] && this.isVisible) {
      console.log('🔄 Edit mode changed - reinitializing form');
      setTimeout(() => {
        this.initializeForm();
      }, 50);
    }
  }

  initializeForm() {
    if (this.isEditMode && this.selectedRoom) {
      console.log('📝 Initializing edit form with room:', this.selectedRoom);
      this.roomForm = {
        roomName: this.selectedRoom.roomName || '',
        roomType: this.selectedRoom.roomType || ''
      };
    } else {
      console.log('🆕 Initializing create form');
      this.roomForm = {
        roomName: '',
        roomType: ''
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
    if (fieldName === 'roomName' || fieldName === 'roomType') {
      this.checkRoomUnique();
    }
    this.validateForm();
  }

  // Check if room name and type combination is unique
  checkRoomUnique(): void {
    const roomName = this.roomForm.roomName?.trim();
    const roomType = this.roomForm.roomType?.trim();
    
    if (!roomName || !roomType) {
      this.roomExists = false;
      this.isRoomValidating = false;
      return;
    }
    
    // Skip validation if room name and type haven't changed in edit mode
    if (this.isEditMode && this.selectedRoom && 
        this.selectedRoom.roomName === roomName && 
        this.selectedRoom.roomType === roomType) {
      this.roomExists = false;
      this.isRoomValidating = false;
      return;
    }
    
    this.isRoomValidating = true;
    const roomId = this.isEditMode && this.selectedRoom ? this.selectedRoom.roomId : undefined;
    
    this.roomsService.checkRoomExists(roomName, roomType, roomId).subscribe({
      next: (response) => {
        this.roomExists = response.exists;
        if (response.exists && (this.submitted || this.touchedFields.has('roomName') || this.touchedFields.has('roomType'))) {
          this.fieldErrors.roomName = response.message || 'Room with this name and type already exists';
        } else {
          this.fieldErrors.roomName = '';
        }
        this.isRoomValidating = false;
      },
      error: (error) => {
        console.error('Error checking room:', error);
        this.roomExists = false;
        this.isRoomValidating = false;
      }
    });
  }

  validateForm(): boolean {
    // Clear previous errors (but keep them if field was touched or form was submitted)
    const previousErrors = { ...this.fieldErrors };
    this.fieldErrors = {};
    let isValid = true;

    // Validate Room Name
    if (!this.roomForm.roomName?.trim()) {
      if (this.submitted || this.touchedFields.has('roomName')) {
        this.fieldErrors.roomName = 'Room Name is required';
      }
      isValid = false;
    } else if (this.roomForm.roomName.trim().length < 2) {
      if (this.submitted || this.touchedFields.has('roomName')) {
        this.fieldErrors.roomName = 'Room Name must be at least 2 characters long';
      }
      isValid = false;
    } else if (this.roomForm.roomName.trim().length > 100) {
      if (this.submitted || this.touchedFields.has('roomName')) {
        this.fieldErrors.roomName = 'Room Name must not exceed 100 characters';
      }
      isValid = false;
    }

    // Validate Room Type
    if (!this.roomForm.roomType?.trim()) {
      if (this.submitted || this.touchedFields.has('roomType')) {
        this.fieldErrors.roomType = 'Room Type is required';
      }
      isValid = false;
    }

    // Check if room name and type combination exists
    if (this.roomExists && this.roomForm.roomName?.trim() && this.roomForm.roomType?.trim()) {
      if (this.submitted || (this.touchedFields.has('roomName') && this.touchedFields.has('roomType'))) {
        this.fieldErrors.roomName = 'Room with this name and type already exists';
      }
      isValid = false;
    }

    if (this.isRoomValidating) {
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
    console.log('💾 Form submit called');
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode && this.selectedRoom) {
      // For edit mode, send UpdateRoomDto with roomId
      const updateData: UpdateRoomDto = {
        roomId: this.selectedRoom.roomId,
        roomName: this.roomForm.roomName.trim(),
        roomType: this.roomForm.roomType
      };

      console.log('📤 Emitting update event with data:', updateData);
      this.save.emit(updateData);
    } else {
      // For create mode, send CreateRoomDto
      const formData: CreateRoomDto = {
        roomName: this.roomForm.roomName.trim(),
        roomType: this.roomForm.roomType
      };

      console.log('📤 Emitting create event with data:', formData);
      this.save.emit(formData);
    }
  }

  onClose() {
    console.log('❌ Closing modal');
    this.close.emit();
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }

  getModalTitle(): string {
    return this.isEditMode ? 'Edit Room' : 'Create New Room';
  }

  getSaveButtonText(): string {
    return this.isEditMode ? 'Update Room' : 'Create Room';
  }
}