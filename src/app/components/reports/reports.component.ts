import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService, ReportListDto } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: ReportListDto[] = [];
  loading = false;
  loadingList = false;
  generatingReport = false;
  error: string | null = null;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loadingList = true;
    this.error = null;
    this.reportsService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports || [];
        this.loadingList = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load reports';
        this.loadingList = false;
        this.reports = [];
        console.error('Error loading reports:', error);
      }
    });
  }

  generateReport(reportType: string, fileFormat: string, periodType?: string): void {
    this.generatingReport = true;
    this.loading = true;
    this.error = null;

    let reportObservable;
    if (reportType === 'Summary') {
      if (!periodType) {
        this.error = 'Please select a period type for summary report';
        this.loading = false;
        this.generatingReport = false;
        return;
      }
      reportObservable = this.reportsService.generateSummaryReport(fileFormat, periodType);
    } else {
      switch (reportType) {
        case 'Nurses':
          reportObservable = this.reportsService.generateNursesReport(fileFormat);
          break;
        case 'Doctors':
          reportObservable = this.reportsService.generateDoctorsReport(fileFormat);
          break;
        case 'Users':
          reportObservable = this.reportsService.generateUsersReport(fileFormat);
          break;
        case 'Patients':
          reportObservable = this.reportsService.generatePatientsReport(fileFormat);
          break;
        case 'Appointments':
          reportObservable = this.reportsService.generateAppointmentsReport(fileFormat);
          break;
        case 'Feedbacks':
          reportObservable = this.reportsService.generateFeedbacksReport(fileFormat);
          break;
        default:
          this.error = 'Invalid report type';
          this.loading = false;
          this.generatingReport = false;
          return;
      }
    }

    reportObservable.subscribe({
      next: (report) => {
        // Download the file immediately
        this.downloadReportById(report.reportId, report.fileName);
        // Reload the reports list
        this.loadReports();
      },
      error: (error) => {
        this.error = error.message || 'Failed to generate report';
        this.loading = false;
        this.generatingReport = false;
        console.error('Error generating report:', error);
      }
    });
  }

  downloadReportById(reportId: number, fileName: string): void {
    this.reportsService.getReportById(reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.generatingReport = false;
      },
      error: (error) => {
        this.error = 'Failed to download report';
        this.loading = false;
        this.generatingReport = false;
        console.error('Error downloading report:', error);
      }
    });
  }

  downloadReport(report: ReportListDto): void {
    this.loading = true;
    this.reportsService.getReportById(report.reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = report.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to download report';
        this.loading = false;
        console.error('Error downloading report:', error);
      }
    });
  }

  deleteReport(reportId: number): void {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    this.loadingList = true;
    this.error = null;
    this.reportsService.deleteReport(reportId).subscribe({
      next: () => {
        this.loadReports();
      },
      error: (error) => {
        this.error = error.message || 'Failed to delete report';
        this.loadingList = false;
        console.error('Error deleting report:', error);
      }
    });
  }

  getFileIcon(fileFormat: string): string {
    const format = fileFormat.toLowerCase();
    if (format === 'pdf') return 'fa-file-pdf';
    if (format === 'csv') return 'fa-file-csv';
    return 'fa-file-excel';
  }

  getFileColor(fileFormat: string): string {
    const format = fileFormat.toLowerCase();
    if (format === 'pdf') return 'pdf-color';
    if (format === 'csv') return 'csv-color';
    return 'excel-color';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
