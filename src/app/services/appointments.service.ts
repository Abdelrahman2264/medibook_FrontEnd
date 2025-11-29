import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, delay } from 'rxjs';
import { 
  AppointmentDetailsDto, 
  Appointment, 
  mapAppointmentDetailsDtoToAppointment,
  CreateAppointmentDto,
  CancelAppointmentDto,
  AssignAppointmentDto,
  CloseAppointmentDto,
  AvailableDateDto,
  AppointmentResponseDto
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly API_BASE_URL = 'http://localhost:5262/api';
  
  constructor(private http: HttpClient) {}

  // Enhanced error handler
  private handleError(operation: string, error: any): never {
    console.error(`❌ Error in ${operation}:`, error);
    
    let userMessage = 'An error occurred. Please try again.';
    
    if (error.status === 0) {
      userMessage = 'Network error - cannot connect to server.';
    } else if (error.status === 400) {
      userMessage = error.error?.message || 'Invalid request.';
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

  // Get all appointments
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/Appointments/all`).pipe(
      delay(500),
      map(response => {
        console.log('📥 Raw appointments data from API:', response);
        
        const appointmentsArray = Array.isArray(response) ? response : 
                                response.data ? response.data : 
                                response;
        
        if (!Array.isArray(appointmentsArray)) {
          console.error('❌ Unexpected API response format:', response);
          throw new Error('Invalid API response format');
        }
        
        const mapped = appointmentsArray.map(dto => {
          const appointment = mapAppointmentDetailsDtoToAppointment(dto);
          console.log('✅ Mapped appointment:', { 
            appointmentId: appointment.appointmentId, 
            patientName: appointment.patientName 
          });
          return appointment;
        });
        
        console.log('📊 Total appointments mapped:', mapped.length);
        return mapped;
      }),
      catchError(error => this.handleError('fetching appointments', error))
    );
  }

  // Get appointment by ID
  getAppointmentById(id: number): Observable<Appointment> {
    console.log('🔍 Fetching appointment by ID:', id);
    return this.http.get<any>(`${this.API_BASE_URL}/Appointments/${id}`).pipe(
      delay(300),
      map(response => {
        console.log('📥 Raw appointment data from API:', response);
        
        const appointmentData = response.data || response;
        const appointment = mapAppointmentDetailsDtoToAppointment(appointmentData);
        
        if (appointment.appointmentId === 0 || !appointment.appointmentId) {
          console.error('❌ ERROR: Appointment ID is 0 or invalid after mapping!', { appointmentData, appointment });
          throw new Error('Invalid appointment ID received from server');
        }
        
        return appointment;
      }),
      catchError(error => this.handleError(`fetching appointment by ID ${id}`, error))
    );
  }

  // Get available dates for a doctor
  getAvailableDates(doctorId: number): Observable<AvailableDateDto[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/Appointments/available-dates/${doctorId}`).pipe(
      delay(300),
      map(response => {
        console.log('📅 Raw available dates data from API:', response);

        // Backend returns an array of strings in format "yyyy-MM-dd hh:mm tt"
        const rawSlots: string[] = Array.isArray(response)
          ? response
          : (response?.data && Array.isArray(response.data))
            ? response.data
            : [];

        const grouped: { [date: string]: string[] } = {};

        rawSlots.forEach(slot => {
          if (typeof slot !== 'string') return;
          const trimmed = slot.trim();
          if (!trimmed) return;

          const parsed = new Date(trimmed);
          if (isNaN(parsed.getTime())) {
            console.warn('⚠️ Unable to parse available slot date:', trimmed);
            return;
          }

          const year = parsed.getFullYear();
          const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
          const day = parsed.getDate().toString().padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`; // "yyyy-MM-dd"

          const hours = parsed.getHours().toString().padStart(2, '0');
          const minutes = parsed.getMinutes().toString().padStart(2, '0');
          const timeValue = `${hours}:${minutes}`; // "HH:mm"

          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }

          // Avoid duplicate times
          if (!grouped[dateKey].includes(timeValue)) {
            grouped[dateKey].push(timeValue);
          }
        });

        const result: AvailableDateDto[] = Object.keys(grouped)
          .sort() // sort by date ascending
          .map(date => ({
            date,
            availableSlots: grouped[date].sort()
          }));

        console.log('📅 Mapped available dates:', result);
        return result;
      }),
      catchError(error => this.handleError(`fetching available dates for doctor ${doctorId}`, error))
    );
  }

  // Create appointment
  createAppointment(body: CreateAppointmentDto): Observable<AppointmentResponseDto> {
    console.log('🔄 Creating appointment with data:', body);
    return this.http.post<AppointmentResponseDto>(`${this.API_BASE_URL}/Appointments/create`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Appointment created successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('creating appointment', error))
    );
  }

  // Cancel appointment
  cancelAppointment(body: CancelAppointmentDto): Observable<any> {
    console.log('🔄 Canceling appointment with data:', body);
    return this.http.put<any>(`${this.API_BASE_URL}/Appointments/cancel`, body).pipe(
      delay(400),
      map(response => {
        console.log('✅ Appointment canceled successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('canceling appointment', error))
    );
  }

  // Assign appointment
  assignAppointment(body: AssignAppointmentDto): Observable<any> {
    console.log('🔄 Assigning appointment with data:', body);
    // Backend returns plain text: "Appointment assigned successfully."
    // Tell HttpClient to treat the response as text to avoid JSON parse errors.
    return this.http.put<any>(
      `${this.API_BASE_URL}/Appointments/assign`,
      body,
      { responseType: 'text' as 'json' }
    ).pipe(
      delay(400),
      map(response => {
        console.log('✅ Appointment assigned successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('assigning appointment', error))
    );
  }

  // Close appointment
  closeAppointment(body: CloseAppointmentDto): Observable<any> {
    console.log('🔄 Closing appointment with data:', body);
    // Backend returns plain text: "Appointment closed successfully."
    // Treat the response as text to prevent JSON parsing errors.
    return this.http.put<any>(
      `${this.API_BASE_URL}/Appointments/close`,
      body,
      { responseType: 'text' as 'json' }
    ).pipe(
      delay(400),
      map(response => {
        console.log('✅ Appointment closed successfully:', response);
        return response;
      }),
      catchError(error => this.handleError('closing appointment', error))
    );
  }

  // Temporary debug method
  debugAppointmentsApiResponse(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/Appointments/all`).pipe(
      delay(200)
    );
  }
}