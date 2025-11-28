import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room, CreateRoomDto, UpdateRoomDto } from '../../../models/room.model';

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
  }

  validateForm(): boolean {
    // Clear previous errors
    this.errorMessage = '';

    if (!this.roomForm.roomName?.trim()) {
      this.errorMessage = 'Room Name is required';
      return false;
    }

    if (!this.roomForm.roomType?.trim()) {
      this.errorMessage = 'Room Type is required';
      return false;
    }

    if (this.roomForm.roomName.trim().length < 2) {
      this.errorMessage = 'Room Name must be at least 2 characters long';
      return false;
    }

    return true;
  }

  onSubmit() {
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