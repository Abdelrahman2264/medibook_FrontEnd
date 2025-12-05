import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { DoctorDetailsDto, CreateDoctorDto, Doctor, mapDoctorDetailsDtoToDoctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Get all doctors - returns mapped Doctor[] from DoctorDetailsDto[]
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<DoctorDetailsDto[]>(`${this.baseUrl}/Doctors/all`).pipe(
      map(dtos => dtos.map(dto => mapDoctorDetailsDtoToDoctor(dto)))
    );
  }

  // Get active doctors - returns mapped Doctor[] from DoctorDetailsDto[]
  getActiveDoctors(): Observable<Doctor[]> {
    return this.http.get<DoctorDetailsDto[]>(`${this.baseUrl}/Doctors/active`).pipe(
      map(dtos => dtos.map(dto => mapDoctorDetailsDtoToDoctor(dto)))
    );
  }

  // Get doctor by ID - returns mapped Doctor from DoctorDetailsDto
  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<DoctorDetailsDto>(`${this.baseUrl}/Doctors/${id}`).pipe(
      map(dto => mapDoctorDetailsDtoToDoctor(dto))
    );
  }

  // Get doctor by User ID - returns mapped Doctor from DoctorDetailsDto
  getDoctorByUserId(userId: number): Observable<Doctor> {
    console.log('🔍 Fetching doctor by User ID:', userId);
    return this.http.get<DoctorDetailsDto>(`${this.baseUrl}/Doctors/byUserId/${userId}`).pipe(
      map(dto => {
        console.log('📥 Raw doctor data from API:', dto);
        const doctor = mapDoctorDetailsDtoToDoctor(dto);
        console.log('✅ Mapped doctor:', { doctorId: doctor.doctorId, fullName: doctor.fullName });
        return doctor;
      })
    );
  }

  // Create doctor - accepts CreateDoctorDto, returns DoctorDetailsDto
  createDoctor(body: CreateDoctorDto): Observable<DoctorDetailsDto> {
    return this.http.post<DoctorDetailsDto>(`${this.baseUrl}/Doctors/create`, body);
  }

  // Update doctor - accepts CreateDoctorDto (without password), returns DoctorDetailsDto
  updateDoctor(id: number, body: Partial<CreateDoctorDto>): Observable<DoctorDetailsDto> {
    return this.http.put<DoctorDetailsDto>(`${this.baseUrl}/Doctors/update/${id}`, body);
  }

  // Delete doctor - Try POST method
  deleteDoctor(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Doctors/delete/${id}`, {});
  }

  // Alternative delete method using Users API
  deleteUser(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Users/${userId}/delete`, {});
  }

  // Enhanced activation/deactivation with comprehensive debugging
  activateUser(userId: number): Observable<any> {
    const url = `${this.baseUrl}/Users/${userId}/activate`;
    console.log('🔧 Attempting to activate user:', userId);
    console.log('🔧 Full URL:', url);
    
    return this.http.patch(url, {}).pipe(
      tap(response => {
        console.log('✅ Activation successful:', response);
      }),
      catchError(error => {
        console.error('❌ Activation failed:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        throw error;
      })
    );
  }

  deactivateUser(userId: number): Observable<any> {
    const url = `${this.baseUrl}/Users/${userId}/deactivate`;
    console.log('🔧 Attempting to deactivate user:', userId);
    console.log('🔧 Full URL:', url);
    
    return this.http.patch(url, {}).pipe(
      tap(response => {
        console.log('✅ Deactivation successful:', response);
      }),
      catchError(error => {
        console.error('❌ Deactivation failed:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        throw error;
      })
    );
  }

  // Toggle active status method
  toggleActiveStatus(userId: number, isActive: boolean): Observable<any> {
    console.log('Toggle active status called:', { userId, isActive });
    
    if (isActive) {
      return this.activateUser(userId);
    } else {
      return this.deactivateUser(userId);
    }
  }

  // Alternative method - try different endpoints
  toggleUserStatus(userId: number, isActive: boolean): Observable<any> {
    const url = `${this.baseUrl}/Users/${userId}/status`;
    console.log('Toggle status URL:', url, 'isActive:', isActive);
    return this.http.patch(url, { isActive });
  }

  // Try using Doctors API instead of Users API
  activateDoctor(doctorId: number): Observable<any> {
    const url = `${this.baseUrl}/Doctors/${doctorId}/activate`;
    console.log('Activate Doctor URL:', url);
    return this.http.patch(url, {});
  }

  deactivateDoctor(doctorId: number): Observable<any> {
    const url = `${this.baseUrl}/Doctors/${doctorId}/deactivate`;
    console.log('Deactivate Doctor URL:', url);
    return this.http.patch(url, {});
  }

  // Test if the API is reachable
  testApiConnection(): Observable<any> {
    const testUrl = `${this.baseUrl}/Users/test`;
    console.log('🧪 Testing API connection to:', testUrl);
    
    return this.http.get(testUrl).pipe(
      tap(() => console.log('✅ API connection test: SUCCESS')),
      catchError(error => {
        console.error('❌ API connection test: FAILED', error);
        return of(null);
      })
    );
  }

  // Test specific activation endpoint
  testActivationEndpoint(userId: number): void {
    const endpoints = [
      { method: 'PATCH', url: `${this.baseUrl}/Users/${userId}/activate` },
      { method: 'PUT', url: `${this.baseUrl}/Users/${userId}/activate` },
      { method: 'POST', url: `${this.baseUrl}/Users/${userId}/activate` },
      { method: 'GET', url: `${this.baseUrl}/Users/${userId}/activate` },
      { method: 'PATCH', url: `${this.baseUrl}/Users/${userId}/deactivate` },
      { method: 'PUT', url: `${this.baseUrl}/Users/${userId}/deactivate` },
      { method: 'POST', url: `${this.baseUrl}/Users/${userId}/deactivate` },
      { method: 'GET', url: `${this.baseUrl}/Users/${userId}/deactivate` },
    ];

    console.log('🧪 Testing activation endpoints for user:', userId);
    
    endpoints.forEach(endpoint => {
      console.log(`🧪 Testing: ${endpoint.method} ${endpoint.url}`);
      this.http.request(endpoint.method, endpoint.url, { body: {} }).subscribe({
        next: (response: any) => console.log(`✅ ${endpoint.method} - SUCCESS`, response),
        error: (error: any) => console.log(`❌ ${endpoint.method} - ${error.status} ${error.statusText}`, error)
      });
    });
  }

  // Test method to find working endpoints
  testActivationEndpoints(doctor: Doctor): void {
    const endpoints = [
      { name: 'Users Activate PATCH', url: `${this.baseUrl}/Users/${doctor.userId}/activate`, method: 'PATCH' },
      { name: 'Users Deactivate PATCH', url: `${this.baseUrl}/Users/${doctor.userId}/deactivate`, method: 'PATCH' },
      { name: 'Users Activate PUT', url: `${this.baseUrl}/Users/${doctor.userId}/activate`, method: 'PUT' },
      { name: 'Users Deactivate PUT', url: `${this.baseUrl}/Users/${doctor.userId}/deactivate`, method: 'PUT' },
      { name: 'Doctors Activate PATCH', url: `${this.baseUrl}/Doctors/${doctor.doctorId}/activate`, method: 'PATCH' },
      { name: 'Doctors Deactivate PATCH', url: `${this.baseUrl}/Doctors/${doctor.doctorId}/deactivate`, method: 'PATCH' },
    ];

    endpoints.forEach(endpoint => {
      console.log(`Testing: ${endpoint.name}`);
      this.http.request(endpoint.method, endpoint.url, { body: {} }).subscribe({
        next: (response: any) => console.log(`✅ ${endpoint.name} - SUCCESS`, response),
        error: (error: any) => console.log(`❌ ${endpoint.name} - ${error.status} ${error.statusText}`)
      });
    });
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