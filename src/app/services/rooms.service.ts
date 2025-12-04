import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap, delay } from 'rxjs';
import { RoomDetailsDto, Room, mapRoomDetailsDtoToRoom, CreateRoomDto, UpdateRoomDto, ApiResponse } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Enhanced error handler
  private handleError(operation: string, error: any): never {
    console.error(`❌ Error in ${operation}:`, error);
    
    let userMessage = 'An error occurred. Please try again.';
    
    if (error.status === 0) {
      userMessage = 'Network error - cannot connect to server.';
    } else if (error.status === 400) {
      userMessage = error.error || 'Invalid request.';
    } else if (error.status === 404) {
      userMessage = 'Resource not found.';
    } else if (error.status === 500) {
      userMessage = 'Server error. Please try again later.';
    }
    
    throw { 
      message: userMessage,
      originalError: error 
    };
  }

  // Get all rooms with delay and better error handling
  getAllRooms(): Observable<Room[]> {
    return this.http.get<any>(`${this.baseUrl}/Rooms/all`).pipe(
      delay(500), // Add delay for better UX
      map(response => {
        console.log('📥 Raw rooms data from API:', response);
        
        // Handle both array response and wrapped response
        const roomsArray = Array.isArray(response) ? response : 
                          response.data ? response.data : 
                          response;
        
        if (!Array.isArray(roomsArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }
        
        const mapped = roomsArray.map(dto => {
          const room = mapRoomDetailsDtoToRoom(dto);
          console.log('✅ Mapped room:', { roomId: room.roomId, roomName: room.roomName });
          return room;
        });
        
        console.log('📊 Total rooms mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError('fetching rooms', error))
    );
  }

  // Get all ACTIVE rooms with delay and better error handling
  getAllActiveRooms(appointmentDate?: Date): Observable<Room[]> {
    let url = `${this.baseUrl}/Rooms/active`;
    const params: any = {};
    
    if (appointmentDate) {
      params.appointmentDate = appointmentDate.toISOString();
      console.log('📅 Fetching active rooms filtered by date:', params.appointmentDate);
    }
    
    return this.http.get<any>(url, { params }).pipe(
      delay(500), // Add delay for better UX
      map(response => {
        console.log('📥 Raw ACTIVE rooms data from API:', response);

        // Handle both array response and wrapped response
        const roomsArray = Array.isArray(response)
          ? response
          : response.data
          ? response.data
          : response;

        if (!Array.isArray(roomsArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }

        const mapped = roomsArray.map(dto => {
          const room = mapRoomDetailsDtoToRoom(dto);
          console.log('✅ Mapped ACTIVE room:', { roomId: room.roomId, roomName: room.roomName });
          return room;
        });

        console.log('📊 Total ACTIVE rooms mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError('fetching ACTIVE rooms', error))
    );
  }


  // Get active rooms
  getActiveRooms(): Observable<Room[]> {
    return this.http.get<any>(`${this.baseUrl}/Rooms/active`).pipe(
      delay(300),
      map(response => {
        console.log('📥 Raw active rooms data from API:', response);
        const roomsArray = Array.isArray(response) ? response : 
                          response.data ? response.data : 
                          response;
        return roomsArray.map((dto: any) => mapRoomDetailsDtoToRoom(dto));
      }),
      catchError(error => this.handleError('fetching active rooms', error))
    );
  }

  // Get active rooms without appointments on a specific date
  getActiveRoomsByDate(appointmentDate: Date): Observable<Room[]> {
    // Format date as ISO string for the API
    const dateParam = appointmentDate.toISOString();
    console.log('📅 Fetching active rooms for date:', dateParam);
    
    return this.http.get<any>(`${this.baseUrl}/Rooms/active`, {
      params: { appointmentDate: dateParam }
    }).pipe(
      delay(300),
      map(response => {
        console.log('📥 Raw active rooms data from API (filtered by date):', response);
        const roomsArray = Array.isArray(response) ? response : 
                          response.data ? response.data : 
                          response;
        return roomsArray.map((dto: any) => mapRoomDetailsDtoToRoom(dto));
      }),
      catchError(error => this.handleError('fetching active rooms by date', error))
    );
  }

  // Get room by ID with better error handling
  getRoomById(id: number): Observable<Room> {
    console.log('🔍 Fetching room by ID:', id);
    return this.http.get<any>(`${this.baseUrl}/Rooms/${id}`).pipe(
      delay(300),
      map(response => {
        console.log('📥 Raw room data from API:', response);
        
        // Handle both direct object and wrapped response
        const roomData = response.data || response;
        
        const room = mapRoomDetailsDtoToRoom(roomData);
        console.log('✅ Mapped room:', { roomId: room.roomId, roomName: room.roomName });
        
        if (room.roomId === 0 || !room.roomId) {
          console.error('❌ ERROR: Room roomId is 0 or invalid after mapping!', { roomData, room });
          throw new Error('Invalid room ID received from server');
        }
        
        return room;
      }),
      catchError(error => this.handleError(`fetching room by ID ${id}`, error))
    );
  }

  // Create room with better response handling
  createRoom(body: CreateRoomDto): Observable<any> {
    console.log('🔄 Creating room with data:', body);
    return this.http.post<any>(`${this.baseUrl}/Rooms/create`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Room created successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('creating room', error))
    );
  }

  // Update room with better error handling
  updateRoom(id: number, body: UpdateRoomDto): Observable<any> {
    console.log('🔄 Update room payload:', { id, body });
    
    // Convert UpdateRoomDto to RoomDetailsDto for the API
    const updateData = {
      roomId: id,
      roomName: body.roomName || '',
      roomType: body.roomType || '',
      isActive: true, // Default value, will be ignored by backend
      createDate: new Date().toISOString() // Default value
    };

    return this.http.put<any>(`${this.baseUrl}/Rooms/update/${id}`, updateData).pipe(
      delay(400),
      map(response => {
        console.log('✅ Room updated successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('updating room', error))
    );
  }

  // Activate room
  activateRoom(roomId: number): Observable<any> {
    console.log('✅ Activating room:', roomId);
    return this.http.put(`${this.baseUrl}/Rooms/active/${roomId}`, {}, {
      responseType: 'text'
    }).pipe(
      delay(300),
      tap(response => {
        console.log('✅ Activate response (raw):', response);
      }),
      catchError(error => this.handleError('activating room', error))
    );
  }

  // Deactivate room
  deactivateRoom(roomId: number): Observable<any> {
    console.log('❌ Deactivating room:', roomId);
    return this.http.put(`${this.baseUrl}/Rooms/inactive/${roomId}`, {}, {
      responseType: 'text'
    }).pipe(
      delay(300),
      tap(response => {
        console.log('❌ Deactivate response (raw):', response);
      }),
      catchError(error => this.handleError('deactivating room', error))
    );
  }



  // Temporary debug method to check API response structure
  debugRoomApiResponse(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Rooms/all`).pipe(
      delay(200)
    );
  }
}