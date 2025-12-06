import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoomsService } from '../../services/rooms.service';
import { Room, CreateRoomDto, UpdateRoomDto } from '../../models/room.model';
import { ConfirmationModalComponent } from '../Shared/confirmation-modal/confirmation-modal.component';
import { RoomFormModalComponent } from '../Shared/room-form-modal/room-form-modal.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationModalComponent, RoomFormModalComponent]
})
export class Rooms implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedType: string = '';

  rooms: Room[] = [];
  statuses: string[] = ['Active', 'Inactive'];
roomTypes: string[] = [
  'Single Room',
  'Double Room',
  'Suite Room',
  'ICU Room',
  'Operation Room',
  'Emergency Room',
  'Maternity Room',
  'Pediatric Room',
  'Consultation Room',
  'Examination Room',
  'Procedure Room',
  'Treatment Room',
  'Laboratory Room',
  'Blood Collection Room',
  'Radiology Room',
  'Ultrasound Room',
  'X-Ray Room',
  'MRI Room',
  'CT Scan Room',
  'ECG Room',
  'Isolation Room',
  'Recovery Room',
  'VIP Room',
  'Ward Room',
  'Semi-Private Room',
  'NICU Room',
  'PICU Room',
  'Oncology Room',
  'Dialysis Room',
  'Physiotherapy Room',
  'Dental Room',
  'Ophthalmology Room',
  'ENT Room'
];

  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  actionInProgress: boolean = false;
  // Track pending room actions to avoid full list reload and flashing
  pendingRoomIds: Set<number> = new Set<number>();
  
  // Modal states
  showRoomModal: boolean = false;
  isEditMode: boolean = false;
  selectedRoom: Room | null = null;
  
  // Confirmation modal states
  showConfirmationModal: boolean = false;
  confirmationConfig: any = {};
  pendingAction: () => void = () => {};

  constructor(
    private roomsService: RoomsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🔄 RoomsComponent initialized');
    this.loadRooms();
  }

  // Force update method
  forceUpdate() {
    this.cdr.detectChanges();
  }

  loadRooms() {
    console.log('🔄 Loading rooms...');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.forceUpdate();

    this.roomsService.getAllRooms().subscribe({
      next: (data: Room[]) => {
        console.log('📋 Rooms loaded:', data.length);
        this.rooms = data;
        this.isLoading = false;
        this.actionInProgress = false;
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error('❌ Error loading rooms:', error);
        this.errorMessage = error.message || 'Failed to load rooms. Please try again.';
        this.isLoading = false;
        this.actionInProgress = false;
        this.forceUpdate();
      }
    });
  }

  // Modal functions
  openCreateModal() {
    console.log('📝 Opening create modal');
    this.isEditMode = false;
    this.selectedRoom = null;
    this.showRoomModal = true;
    
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  openEditModal(room: Room) {
    console.log('📝 Opening edit modal for:', {
      roomName: room.roomName,
      roomId: room.roomId
    });
    
    if (!room) {
      console.error('❌ Cannot open edit modal: room is null');
      return;
    }
    
    if (!room.roomId || room.roomId === 0) {
      console.error('❌ ERROR: Cannot open edit modal - roomId is invalid:', room);
      this.showError('Invalid room ID. Cannot edit this room.');
      return;
    }
    
    this.isEditMode = true;
    this.selectedRoom = { ...room }; // Create a copy to avoid reference issues
    
    setTimeout(() => {
      this.showRoomModal = true;
      this.forceUpdate();
      console.log('✅ Modal opened with room data:', {
        roomId: this.selectedRoom?.roomId,
        roomName: this.selectedRoom?.roomName
      });
    }, 50);
  }

  closeModal() {
    console.log('❌ Closing modal');
    this.showRoomModal = false;
    this.selectedRoom = null;
    this.forceUpdate();
  }

  onSaveRoom(roomData: CreateRoomDto | UpdateRoomDto) {
    console.log('💾 Saving room data:', roomData);
    
    this.isLoading = true;
    this.forceUpdate();

    if (this.isEditMode && this.selectedRoom) {
      if (!this.selectedRoom.roomId || this.selectedRoom.roomId === 0) {
        console.error('❌ ERROR: Cannot update - roomId is invalid:', this.selectedRoom);
        this.showError('Invalid room ID. Cannot update this room.');
        this.isLoading = false;
        this.forceUpdate();
        return;
      }
      
      console.log('💾 Updating room:', {
        roomId: this.selectedRoom.roomId,
        updateData: roomData
      });
      
      this.roomsService.updateRoom(this.selectedRoom.roomId, roomData as UpdateRoomDto).subscribe({
        next: (response: any) => {
          console.log('✅ Room updated successfully');
          this.showSuccess('Room updated successfully!');
          this.closeModal();
          this.actionInProgress = true;
          setTimeout(() => this.loadRooms(), 1000);
        },
        error: (error: any) => {
          console.error('❌ Error updating room:', error);
          this.isLoading = false;
          this.showError(error.message || 'Failed to update room. Please try again.');
          this.forceUpdate();
        }
      });
    } else {
      this.roomsService.createRoom(roomData as CreateRoomDto).subscribe({
        next: (response: any) => {
          console.log('✅ Room created successfully');
          this.showSuccess('Room created successfully!');
          this.closeModal();
          this.actionInProgress = true;
          setTimeout(() => this.loadRooms(), 1000);
        },
        error: (error: any) => {
          console.error('❌ Error creating room:', error);
          this.isLoading = false;
          this.showError(error.message || 'Failed to create room. Please try again.');
          this.forceUpdate();
        }
      });
    }
  }

  // Enhanced error display without alert
  private showError(message: string) {
    this.errorMessage = message;
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = '';
        this.forceUpdate();
      }
    }, 5000);
    this.forceUpdate();
  }

  private showSuccess(message: string) {
    // You can implement a toast notification here
    console.log('✅ Success:', message);
    // For now, we'll just log to console
  }

  // Filtering and Sorting
  filteredRooms(): Room[] {
    const filtered = this.rooms
      .filter(r => 
        r.roomName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.roomType?.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .filter(r => !this.selectedStatus || r.state === this.selectedStatus)
      .filter(r => !this.selectedType || r.roomType === this.selectedType);
    
    return filtered;
  }

  sortByName() {
    console.log('🔤 Sorting rooms by name');
    this.rooms.sort((a, b) => a.roomName.localeCompare(b.roomName));
    this.forceUpdate();
  }

  sortByType() {
    console.log('🔤 Sorting rooms by type');
    this.rooms.sort((a, b) => a.roomType.localeCompare(b.roomType));
    this.forceUpdate();
  }

  // Activation/Deactivation
  toggleActive(room: Room) {
    const newActiveState = !room.isActive;
    
    console.log('🔄 Toggling active state for:', room.roomName, 'New state:', newActiveState);

    this.confirmationConfig = {
      title: `${newActiveState ? 'Activate' : 'Deactivate'} Room`,
      message: `Are you sure you want to ${newActiveState ? 'activate' : 'deactivate'} <strong>${room.roomName}</strong>?`,
      icon: newActiveState ? 'fas fa-toggle-on' : 'fas fa-toggle-off',
      iconColor: newActiveState ? '#28a745' : '#dc3545',
      confirmText: newActiveState ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      confirmButtonClass: newActiveState ? 'btn-success' : 'btn-confirm'
    };

    this.pendingAction = () => this.executeToggleActive(room, newActiveState);
    this.showConfirmationModal = true;
    this.forceUpdate();
  }

  private executeToggleActive(room: Room, newActiveState: boolean) {
    const action = newActiveState ? 'activate' : 'deactivate';
    console.log('🚀 Executing toggle active for:', room.roomName);
    // Optimistic update: update local state immediately to avoid flashing
    const roomId = room.roomId;
    const previousState = room.isActive;
    // mark as pending
    this.pendingRoomIds.add(roomId);
    // apply optimistic change
    room.isActive = newActiveState;
    room.state = newActiveState ? 'Active' : 'Inactive';
    this.forceUpdate();

    const apiCall$ = newActiveState 
      ? this.roomsService.activateRoom(roomId)
      : this.roomsService.deactivateRoom(roomId);

    apiCall$.subscribe({
      next: (response: any) => {
        console.log(`✅ Room ${action}d successfully:`, response);
        // clear pending flag
        this.pendingRoomIds.delete(roomId);
        this.showSuccess(`Room ${action}d successfully!`);
        this.forceUpdate();
      },
      error: (error: any) => {
        console.error(`❌ Failed to ${action} room:`, error);
        // revert optimistic change
        room.isActive = previousState;
        room.state = previousState ? 'Active' : 'Inactive';
        this.pendingRoomIds.delete(roomId);
        this.showConfirmationModal = false;
        this.showError(error.message || `Failed to ${action} room. Please try again.`);
        this.forceUpdate();
      }
    });
  }

  

  

  // Confirmation modal handlers
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

  // Stats and Utilities
  countActive(): number {
    return this.rooms.filter(r => r.isActive).length;
  }

  countInactive(): number {
    return this.rooms.filter(r => !r.isActive).length;
  }

  clearAllFilters() {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.forceUpdate();
  }

  // Get card color based on index
  getCardColor(index: number): string {
    const colors = ['#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#fce4ec', '#e0f2f1', '#fbe9e7'];
    return colors[index % colors.length];
  }

  // Get status badge class
  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  }
}





