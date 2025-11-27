import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: any;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use HTTPS as primary, HTTP as fallback
  private readonly API_BASE_URL = 'https://localhost:7281/api/Auth';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api/Auth';
  
  // You can change this to use HTTP if HTTPS doesn't work
  // Try HTTP first since sign-in works with it
  private useHttps = false; // Changed to false to match working sign-in
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load token from storage on service initialization
    const token = this.getToken();
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  /**
   * Login endpoint
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.setCurrentUser(response.user);
            }
          }
        })
      );
  }

  /**
   * SignIn endpoint (alternative login)
   */
  signIn(credentials: SignInRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/signIn`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.setCurrentUser(response.user);
            }
          }
        })
      );
  }

  /**
   * SignOut endpoint
   */
  signOut(): Observable<any> {
    return this.http.post(`${this.baseUrl}/signOut`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  /**
   * Logout endpoint
   */
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  /**
   * Send verification email
   * First call: sends verification code (without code field)
   * Second call: verifies the code (with code field)
   */
  sendVerification(data: {
    email: string;
    firstname: string;
    lastname: string;
    gender: string;
    code?: string;
  }): Observable<any> {
    const url = `${this.baseUrl}/send-verification`;
    console.log('🔗 AuthService - Request URL:', url);
    console.log('📦 AuthService - Request body:', JSON.stringify(data, null, 2));
    return this.http.post(url, data);
  }

  /**
   * Forget password (legacy - kept for backward compatibility)
   */
  forgetPassword(request: ForgetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/forget-password`, request);
  }

  /**
   * Check email and send verification code for forget password
   */
  checkEmailForForgetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/check-email`, { email });
  }

  /**
   * Verify forget password code
   */
  verifyForgetPasswordCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-forget-password-code`, { email, code });
  }

  /**
   * Reset password after verification
   */
  resetPassword(email: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      email,
      newPassword,
      confirmPassword
    });
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set token in storage
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Set current user in storage
   */
  setCurrentUser(user: any): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  /**
   * Get authorization header
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  /**
   * Logout and redirect to login
   */
  logoutAndRedirect(): void {
    this.logout().subscribe({
      next: () => {
        this.router.navigate(['/signin']);
      },
      error: () => {
        // Even if logout fails, clear local auth and redirect
        this.clearAuth();
        this.router.navigate(['/signin']);
      }
    });
  }
}

