import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserDetailsDto, Admin, mapUserDetailsDtoToAdmin, UpdateAdminDto, CreateAdminDto } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Get all admins - returns mapped Admin[] from UserDetailsDto[]
  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Users/allAdmins`).pipe(
      map(dtos => {
        console.log('📥 Raw admins data from API:', dtos);
        const mapped = dtos.map(dto => {
          const admin = mapUserDetailsDtoToAdmin(dto);
          console.log('✅ Mapped admin:', { id: admin.id, fullName: admin.fullName });
          return admin;
        });
        console.log('📊 Total admins mapped:', mapped.length);
        return mapped;
      })
    );
  }

  // Get active admins - returns mapped Admin[] from UserDetailsDto[]
  getActiveAdmins(): Observable<Admin[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Users/activeAdmins`).pipe(
      map(dtos => {
        console.log('📥 Raw active admins data from API:', dtos);
        return dtos.map(dto => mapUserDetailsDtoToAdmin(dto));
      })
    );
  }

  // Get admin by ID - returns mapped Admin from UserDetailsDto
  getAdminById(id: number): Observable<Admin> {
    console.log('🔍 Fetching admin by ID:', id);
    return this.http.get<any>(`${this.baseUrl}/Users/${id}`).pipe(
      map(dto => {
        console.log('📥 Raw admin data from API:', dto);
        const admin = mapUserDetailsDtoToAdmin(dto);
        console.log('✅ Mapped admin:', { id: admin.id, fullName: admin.fullName });
        if (admin.id === 0 || !admin.id) {
          console.error('❌ ERROR: Admin id is 0 or invalid after mapping!', { dto, admin });
        }
        return admin;
      })
    );
  }

  // Create admin - accepts CreateAdminDto, returns UserDetailsDto
  createAdmin(body: CreateAdminDto): Observable<UserDetailsDto> {
    console.log('🔄 Creating admin with data:', { 
      ...body, 
      password: body.password ? '[REDACTED]' : 'No Password' 
    });
    return this.http.post<UserDetailsDto>(`${this.baseUrl}/Users/createAdmin`, body);
  }

  // Update admin - accepts UpdateAdminDto, returns UserDetailsDto
  updateAdmin(id: number, body: UpdateAdminDto): Observable<UserDetailsDto> {
    // Convert to the exact property names expected by backend
    const payload: any = {};
    
    if (body.firstName !== undefined) payload.firstName = body.firstName;
    if (body.lastName !== undefined) payload.lastName = body.lastName;
    if (body.mobilePhone !== undefined) payload.mobilePhone = body.mobilePhone;
    if (body.gender !== undefined) payload.gender = body.gender;
    if (body.mitrialStatus !== undefined) payload.mitrialStatus = body.mitrialStatus;
    if (body.profileImage !== undefined) payload.profileImage = body.profileImage;
    
    console.log('🔄 Update admin payload:', { id, payload });
    
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
  debugAdminApiResponse(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Users/allAdmins`);
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