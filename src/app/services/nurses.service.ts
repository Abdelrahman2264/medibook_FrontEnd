import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { NurseDetailsDto, CreateNurseDto, Nurse, mapNurseDetailsDtoToNurse, UpdateNurseDto } from '../models/nurse.model';

@Injectable({
  providedIn: 'root'
})
export class NursesService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Get all nurses - returns mapped Nurse[] from NurseDetailsDto[]
  getAllNurses(): Observable<Nurse[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Nurses/all`).pipe(
      map(dtos => {
        console.log('📥 Raw nurses data from API:', dtos);
        const mapped = dtos.map(dto => {
          const nurse = mapNurseDetailsDtoToNurse(dto);
          console.log('✅ Mapped nurse:', { nurseId: nurse.nurseId, fullName: nurse.fullName });
          return nurse;
        });
        console.log('📊 Total nurses mapped:', mapped.length);
        return mapped;
      })
    );
  }

  // Get active nurses - returns mapped Nurse[] from NurseDetailsDto[]
  getActiveNurses(): Observable<Nurse[]> {
    return this.http.get<any>(`${this.baseUrl}/Nurses/active`).pipe(
      map(response => {
        console.log('📥 Raw active nurses data from API:', response);
        const arr = Array.isArray(response) ? response : (response.data ? response.data : response);
        if (!Array.isArray(arr)) {
          console.error('❌ Unexpected active nurses response format:', response);
          return [] as Nurse[];
        }
        return arr.map((dto: any) => mapNurseDetailsDtoToNurse(dto));
      })
    );
  }

  // Get nurse by ID - returns mapped Nurse from NurseDetailsDto
  getNurseById(id: number): Observable<Nurse> {
    console.log('🔍 Fetching nurse by ID:', id);
    return this.http.get<any>(`${this.baseUrl}/Nurses/${id}`).pipe(
      map(dto => {
        console.log('📥 Raw nurse data from API:', dto);
        const nurse = mapNurseDetailsDtoToNurse(dto);
        console.log('✅ Mapped nurse:', { nurseId: nurse.nurseId, fullName: nurse.fullName });
        if (nurse.nurseId === 0 || !nurse.nurseId) {
          console.error('❌ ERROR: nurseId is 0 or invalid after mapping!', { dto, nurse });
        }
        return nurse;
      })
    );
  }

  // Create nurse - accepts CreateNurseDto, returns NurseDetailsDto
  createNurse(body: CreateNurseDto): Observable<NurseDetailsDto> {
    console.log('🔄 Creating nurse with data:', { 
      ...body, 
      password: body.password ? '[REDACTED]' : 'No Password' 
    });
    return this.http.post<NurseDetailsDto>(`${this.baseUrl}/Nurses/create`, body);
  }

  // Update nurse - accepts UpdateNurseDto, returns NurseDetailsDto
  updateNurse(id: number, body: UpdateNurseDto): Observable<NurseDetailsDto> {
    // Convert to the exact property names expected by backend
    const payload: any = {};
    
    if (body.bio !== undefined) payload.bio = body.bio;
    if (body.firstName !== undefined) payload.firstName = body.firstName;
    if (body.lastName !== undefined) payload.lastName = body.lastName;
    if (body.mobilePhone !== undefined) payload.mobilePhone = body.mobilePhone;
    if (body.profileImage !== undefined) payload.profileImage = body.profileImage;
    if (body.mitrialStatus !== undefined) payload.mitrialStatus = body.mitrialStatus;
    
    console.log('🔄 Update nurse payload:', { id, payload });
    
    return this.http.put<NurseDetailsDto>(`${this.baseUrl}/Nurses/update/${id}`, payload);
  }

  // Activation/deactivation - reuse Users API endpoints
  activateUser(userId: number): Observable<any> {
    console.log('🔄 Activating user:', userId);
    return this.http.patch(`${this.baseUrl}/Users/${userId}/activate`, {});
  }

  deactivateUser(userId: number): Observable<any> {
    console.log('🔄 Deactivating user:', userId);
    return this.http.patch(`${this.baseUrl}/Users/${userId}/deactivate`, {});
  }

  // Temporary debug method to check API response structure
  debugNurseApiResponse(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Nurses/all`);
  }
}