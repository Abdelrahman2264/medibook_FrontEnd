import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactUsDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactUsResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  private useHttps = false;

  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  sendContactMessage(dto: ContactUsDto): Observable<ContactUsResponse> {
    return this.http.post<ContactUsResponse>(`${this.baseUrl}/Contact/send`, dto);
  }
}

