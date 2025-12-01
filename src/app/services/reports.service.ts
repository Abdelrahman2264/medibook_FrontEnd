import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface ReportListDto {
  reportId: number;
  fileName: string;
  fileFormat: string;
  reportDate: string;
  reportType: string;
  periodType?: string;
  description: string;
}

export interface CreateReportDto {
  reportType: string;
  fileFormat: string;
  periodType?: string;
  description?: string;
}

export interface ReportDto {
  reportId: number;
  fileName: string;
  fileFormat: string;
  reportDate: string;
  reportType: string;
  periodType?: string;
  description: string;
  fileContent?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly API_BASE_URL = 'http://localhost:5262/api';

  constructor(private http: HttpClient) {}

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

  // Get all reports
  getAllReports(): Observable<ReportListDto[]> {
    return this.http.get<ReportListDto[]>(`${this.API_BASE_URL}/Reports/all`).pipe(
      catchError(error => throwError(() => this.handleError('fetching reports', error)))
    );
  }

  // Get report file by ID
  getReportById(id: number): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/Reports/${id}`, {
      responseType: 'blob'
    }).pipe(
      catchError(error => throwError(() => this.handleError(`fetching report ${id}`, error)))
    );
  }

  // Generate Nurses Report
  generateNursesReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Nurses',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Nurses Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/nurses`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating nurses report', error)))
    );
  }

  // Generate Doctors Report
  generateDoctorsReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Doctors',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Doctors Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/doctors`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating doctors report', error)))
    );
  }

  // Generate Users Report
  generateUsersReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Users',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Users Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/users`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating users report', error)))
    );
  }

  // Generate Patients Report
  generatePatientsReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Patients',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Patients Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/patients`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating patients report', error)))
    );
  }

  // Generate Appointments Report
  generateAppointmentsReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Appointments',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Appointments Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/appointments`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating appointments report', error)))
    );
  }

  // Generate Feedbacks Report
  generateFeedbacksReport(fileFormat: string): Observable<ReportDto> {
    const dto: CreateReportDto = {
      reportType: 'Feedbacks',
      fileFormat: fileFormat === 'XLSX' ? 'XLSX' : fileFormat,
      description: `Feedbacks Report - ${fileFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/feedbacks`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating feedbacks report', error)))
    );
  }

  // Generate Summary Report
  generateSummaryReport(fileFormat: string, periodType: string): Observable<ReportDto> {
    // Normalize file format - ensure it's uppercase and handle Excel/XLSX
    let normalizedFormat = fileFormat.toUpperCase();
    if (normalizedFormat === 'EXCEL') {
      normalizedFormat = 'XLSX';
    }
    
    const dto: CreateReportDto = {
      reportType: 'Summary',
      fileFormat: normalizedFormat,
      periodType: periodType,
      description: `${periodType} Summary Report - ${normalizedFormat}`
    };
    return this.http.post<ReportDto>(`${this.API_BASE_URL}/Reports/generate/summary`, dto).pipe(
      catchError(error => throwError(() => this.handleError('generating summary report', error)))
    );
  }

  // Delete Report
  deleteReport(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/Reports/${id}`).pipe(
      catchError(error => throwError(() => this.handleError('deleting report', error)))
    );
  }

  // Download report file
  downloadReport(report: ReportListDto): void {
    this.getReportById(report.reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = report.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        alert('Failed to download report. Please try again.');
      }
    });
  }
}

