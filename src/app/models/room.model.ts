// src/app/models/room.model.ts

export interface RoomDetailsDto {
  roomId: number;
  roomName: string;
  roomType: string;
  isActive: boolean;
  createDate: string;
}

export interface Room {
  roomId: number;
  roomName: string;
  roomType: string;
  isActive: boolean;
  state: string;
  createDate: string;
  typeIcon: string;
  typeColor: string;
}

// For creating new rooms
export interface CreateRoomDto {
  roomName: string;
  roomType: string;
}

// For updating rooms
export interface UpdateRoomDto {
  roomId?: number; // Include ID for clarity
  roomName?: string;
  roomType?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

// Enhanced mapping function from RoomDetailsDto to Room
export function mapRoomDetailsDtoToRoom(dto: any): Room {
  console.log('🔍 Raw Room DTO received for mapping:', dto);
  
  // Handle API response structure - check for data property first
  const roomData = dto.data || dto;
  
  // Handle all possible property name variations
  const roomId = roomData.roomId ?? roomData.RoomId ?? 0;
  const isActive = roomData.isActive ?? roomData.IsActive ?? false;
  
  console.log('🔍 Extracted IDs:', { roomId, isActive });

  if (roomId === 0) {
    console.error('❌ CRITICAL: Room roomId is 0 after mapping! Full DTO:', roomData);
  }

  const roomName = roomData.roomName ?? roomData.RoomName ?? '';
  const roomType = roomData.roomType ?? roomData.RoomType ?? '';
  const createDate = roomData.createDate ?? roomData.CreateDate ?? '';

  // Determine icon and color based on room type
  const { icon, color } = getRoomTypeInfo(roomType);

  const mappedRoom: Room = {
    roomId: roomId,
    roomName: roomName,
    roomType: roomType,
    isActive: isActive,
    state: isActive ? 'Active' : 'Inactive',
    createDate: createDate,
    typeIcon: icon,
    typeColor: color
  };

  console.log('✅ Mapped room:', mappedRoom);
  return mappedRoom;
}

// Helper function to get room type icon and color
function getRoomTypeInfo(roomType: string): { icon: string; color: string } {
  const type = roomType.toLowerCase();
  
  if (type.includes('single') || type.includes('private')) {
    return { icon: 'fas fa-bed', color: '#4fc3f7' };
  } else if (type.includes('double') || type.includes('shared')) {
    return { icon: 'fas fa-bed', color: '#66bb6a' };
  } else if (type.includes('suite') || type.includes('deluxe')) {
    return { icon: 'fas fa-couch', color: '#ffb74d' };
  } else if (type.includes('icu') || type.includes('critical')) {
    return { icon: 'fas fa-procedures', color: '#e53935' };
  } else if (type.includes('operation') || type.includes('surgery')) {
    return { icon: 'fas fa-cut', color: '#8e24aa' };
  } else if (type.includes('emergency')) {
    return { icon: 'fas fa-ambulance', color: '#f4511e' };
  } else if (type.includes('maternity')) {
    return { icon: 'fas fa-baby', color: '#e91e63' };
  } else if (type.includes('pediatric')) {
    return { icon: 'fas fa-child', color: '#00acc1' };
  } else {
    return { icon: 'fas fa-door-closed', color: '#78909c' };
  }
}