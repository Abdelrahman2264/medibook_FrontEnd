import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserDetailsDto, Patient, mapUserDetailsDtoToPatient, UpdatePatientDto } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Get all patients - returns mapped Patient[] from UserDetailsDto[]
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Users/all`).pipe(
      map(dtos => {
        console.log('📥 Raw patients data from API:', dtos);
        const mapped = dtos.map(dto => {
          const patient = mapUserDetailsDtoToPatient(dto);
          console.log('✅ Mapped patient:', { id: patient.id, fullName: patient.fullName });
          return patient;
        });
        console.log('📊 Total patients mapped:', mapped.length);
        return mapped;
      })
    );
  }

  // Get active patients - returns mapped Patient[] from UserDetailsDto[]
  getActivePatients(): Observable<Patient[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Users/active`).pipe(
      map(dtos => {
        console.log('📥 Raw active patients data from API:', dtos);
        return dtos.map(dto => mapUserDetailsDtoToPatient(dto));
      })
    );
  }

  // Get patient by ID - returns mapped Patient from UserDetailsDto
  getPatientById(id: number): Observable<Patient> {
    console.log('🔍 Fetching patient by ID:', id);
    return this.http.get<any>(`${this.baseUrl}/Users/${id}`).pipe(
      map(dto => {
        console.log('📥 Raw patient data from API:', dto);
        const patient = mapUserDetailsDtoToPatient(dto);
        console.log('✅ Mapped patient:', { id: patient.id, fullName: patient.fullName });
        if (patient.id === 0 || !patient.id) {
          console.error('❌ ERROR: Patient id is 0 or invalid after mapping!', { dto, patient });
        }
        return patient;
      })
    );
  }

  // Update patient - accepts UpdatePatientDto, returns UserDetailsDto
  updatePatient(id: number, body: UpdatePatientDto): Observable<UserDetailsDto> {
    // Convert to the exact property names expected by backend
    const payload: any = {};
    
    if (body.firstName !== undefined) payload.firstName = body.firstName;
    if (body.lastName !== undefined) payload.lastName = body.lastName;
    if (body.mobilePhone !== undefined) payload.mobilePhone = body.mobilePhone;
    if (body.gender !== undefined) payload.gender = body.gender;
    if (body.mitrialStatus !== undefined) payload.mitrialStatus = body.mitrialStatus;
    if (body.profileImage !== undefined) payload.profileImage = body.profileImage;
    
    console.log('🔄 Update patient payload:', { id, payload });
    
    return this.http.put<UserDetailsDto>(`${this.baseUrl}/Users/update/${id}`, payload);
  }

  // Activation/deactivation
  activateUser(userId: number): Observable<any> {
    console.log('🔄 Activating user:', userId);
    return this.http.patch(`${this.baseUrl}/Users/${userId}/activate`, {});
  }

  deactivateUser(userId: number): Observable<any> {
    console.log('🔄 Deactivating user:', userId);
    return this.http.patch(`${this.baseUrl}/Users/${userId}/deactivate`, {});
  }

  // Temporary debug method to check API response structure
  debugPatientApiResponse(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Users/all`);
  }

  /**
   * Check if email exists (for uniqueness validation)
   */
  checkEmailExists(email: string, userId?: number): Observable<{ exists: boolean; message: string }> {
    const payload: any = { email };
    if (userId !== undefined && userId !== null) {
      payload.userId = userId;
    }
    return this.http.post<{ exists: boolean; message: string }>(`${this.baseUrl}/Users/check-email`, payload);
  }

  /**
   * Check if phone number exists (for uniqueness validation)
   */
  checkPhoneExists(phone: string, userId?: number): Observable<{ exists: boolean; message: string }> {
    const payload: any = { phone };
    if (userId !== undefined && userId !== null) {
      payload.userId = userId;
    }
    return this.http.post<{ exists: boolean; message: string }>(`${this.baseUrl}/Users/check-phone`, payload);
  }
}