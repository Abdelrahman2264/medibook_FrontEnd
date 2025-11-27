import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {

  private baseUrl = 'https://localhost:7281/api/Doctors';

  constructor(private http: HttpClient) {}

  // Get all doctors
  getAllDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // Get active doctors
  getActiveDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/active`);
  }

  // Get doctor by ID
  getDoctorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Create doctor
  createDoctor(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, body);
  }

  // Update doctor
  updateDoctor(id: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, body);
  }
}
