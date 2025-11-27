import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  // Use HTTP to match auth service (since sign-in works with HTTP)
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load user from storage on initialization
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Get current user from API
   * Update this endpoint based on your actual API
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/User/current`)
      .pipe(
        // Update local storage when user is fetched
        // You may need to adjust this based on your API response
      );
  }

  /**
   * Get current user from storage (synchronous)
   */
  getCurrentUserFromStorage(): any | null {
    return this.authService.getCurrentUser();
  }

  /**
   * Update current user
   */
  updateCurrentUser(user: any): void {
    this.authService.setCurrentUser(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Clear current user
   */
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  /**
   * Create new user
   * Maps frontend camelCase to backend PascalCase DTO
   */
  createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    password: string;
    gender: string;
    mitrialStatus: string;
    profileImage: string;
    dateOfBirth: string;
  }): Observable<any> {
    // Ensure all required fields have actual values (not empty strings)
    const firstName = userData.firstName?.trim();
    const lastName = userData.lastName?.trim();
    const email = userData.email?.trim();
    const mobilePhone = userData.mobilePhone?.trim();
    const password = userData.password;
    const gender = userData.gender?.trim();
    const mitrialStatus = userData.mitrialStatus?.trim();
    const dateOfBirth = userData.dateOfBirth;

    // Validate that all required fields have values
    if (!firstName || !lastName || !email || !mobilePhone || !password || !gender || !mitrialStatus || !dateOfBirth) {
      console.error('❌ UserService - Missing required fields:', {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        mobilePhone: !!mobilePhone,
        password: !!password,
        gender: !!gender,
        mitrialStatus: !!mitrialStatus,
        dateOfBirth: !!dateOfBirth
      });
    }

    // Build the DTO object - send directly (not wrapped) as camelCase
    // The backend has JsonPropertyName attributes to map camelCase to PascalCase properties
    const payload: any = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      mobilePhone: mobilePhone || '',
      password: password || '',
      gender: gender || '',
      mitrialStatus: mitrialStatus || '',
      dateOfBirth: dateOfBirth || '', // ISO string format
      // ProfileImage: send as base64 string (backend will convert to byte[])
      profileImage: userData.profileImage && userData.profileImage.trim() !== '' 
        ? userData.profileImage  // Send base64 string directly
        : null                   // null for nullable string?
    };

    const url = `${this.baseUrl}/Users/create`;
    
    // Log the actual payload that will be sent
    console.log('🔗 UserService - Creating user at:', url);
    console.log('📦 UserService - Raw Payload Object:', payload);
    console.log('📦 UserService - Payload JSON:', JSON.stringify({
      ...payload,
      profileImage: payload.profileImage ? `[Base64 String: ${payload.profileImage.length} chars]` : 'null'
    }, null, 2));
    console.log('📋 UserService - Payload Field Values:', {
      'firstName': payload.firstName,
      'lastName': payload.lastName,
      'email': payload.email,
      'mobilePhone': payload.mobilePhone,
      'password': payload.password ? '[REDACTED]' : '',
      'gender': payload.gender,
      'mitrialStatus': payload.mitrialStatus,
      'dateOfBirth': payload.dateOfBirth,
      'hasProfileImage': !!payload.profileImage,
      'profileImageLength': payload.profileImage?.length || 0
    });
    
    return this.http.post<any>(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

}

