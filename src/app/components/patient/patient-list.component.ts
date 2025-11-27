import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  status: string;
  email: string;
  phone: string;
  department: string;
  doctor: string;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {
  
  allPatients: Patient[] = [
    {
      id: 1, 
      name: 'John Doe', 
      age: 35, 
      condition: 'Diabetes', 
      lastVisit: '2025-11-10', 
      status: 'In Treatment',
      email: 'john.doe@email.com', 
      phone: '(555) 123-4567',
      department: 'Endocrinology',
      doctor: 'Dr. Smith'
    },
    {
      id: 2, 
      name: 'Jane Smith', 
      age: 28, 
      condition: 'Heart Condition', 
      lastVisit: '2025-11-22', 
      status: 'Recovered',
      email: 'jane.smith@email.com', 
      phone: '(555) 234-5678',
      department: 'Cardiology',
      doctor: 'Dr. Johnson'
    },
    {
      id: 3, 
      name: 'Mike Johnson', 
      age: 45, 
      condition: 'Kidney Disease', 
      lastVisit: '2025-10-05', 
      status: 'Critical',
      email: 'mike.johnson@email.com', 
      phone: '(555) 345-6789',
      department: 'Nephrology',
      doctor: 'Dr. Brown'
    },
    {
      id: 4, 
      name: 'Mary Brown', 
      age: 32, 
      condition: 'Emergency', 
      lastVisit: '2025-11-01', 
      status: 'Emergency',
      email: 'mary.brown@email.com', 
      phone: '(555) 456-7890',
      department: 'Emergency',
      doctor: 'Dr. Wilson'
    },
    {
      id: 5, 
      name: 'Sarah Wilson', 
      age: 29, 
      condition: 'Diabetes', 
      lastVisit: '2025-11-15', 
      status: 'In Treatment',
      email: 'sarah.wilson@email.com', 
      phone: '(555) 567-8901',
      department: 'Endocrinology',
      doctor: 'Dr. Smith'
    },
    {
      id: 6, 
      name: 'David Lee', 
      age: 52, 
      condition: 'Heart Condition', 
      lastVisit: '2025-10-20', 
      status: 'Recovered',
      email: 'david.lee@email.com', 
      phone: '(555) 678-9012',
      department: 'Cardiology',
      doctor: 'Dr. Johnson'
    },
    {
      id: 7, 
      name: 'Emily Davis', 
      age: 38, 
      condition: 'Kidney Disease', 
      lastVisit: '2025-11-18', 
      status: 'Critical',
      email: 'emily.davis@email.com', 
      phone: '(555) 789-0123',
      department: 'Nephrology',
      doctor: 'Dr. Brown'
    },
    {
      id: 8, 
      name: 'Robert Garcia', 
      age: 41, 
      condition: 'Emergency', 
      lastVisit: '2025-11-25', 
      status: 'Emergency',
      email: 'robert.garcia@email.com', 
      phone: '(555) 890-1234',
      department: 'Emergency',
      doctor: 'Dr. Wilson'
    }
  ];

  patients: Patient[] = [...this.allPatients];
  searchTerm: string = '';
  showFilters: boolean = false;
  isSearching: boolean = false;
  selectedPatient: Patient | null = null;
  showPatientDetails: boolean = false;
  showSortOptions: boolean = false;
  showSuggestions: boolean = false;
  activeTab: string = 'info';
  sortField: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  filters = {
    status: '',
    condition: '',
    ageRange: '',
    visitDate: '',
    department: ''
  };

  statusOptions = ['In Treatment', 'Recovered', 'Critical', 'Emergency'];
  conditionOptions = ['Diabetes', 'Heart Condition', 'Kidney Disease', 'Emergency'];
  departmentOptions = ['Cardiology', 'Endocrinology', 'Nephrology', 'Emergency', 'Neurology'];
  
  ageRangeOptions = [
    { value: '', label: 'All Ages' },
    { value: '0-18', label: '0-18 Years' },
    { value: '19-35', label: '19-35 Years' },
    { value: '36-50', label: '36-50 Years' },
    { value: '51-100', label: '51+ Years' }
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients = [...this.allPatients];
  }

  // Medical Overview Statistics
  getMedicalOverviewStats(): any {
    const totalPatients = this.allPatients.length;
    const inTreatment = this.allPatients.filter(p => p.status === 'In Treatment').length;
    const criticalCases = this.allPatients.filter(p => p.status === 'Critical' || p.status === 'Emergency').length;
    const recovered = this.allPatients.filter(p => p.status === 'Recovered').length;
    
    const conditionsStats = this.getConditionsStats();
    const departmentsStats = this.getDepartmentsStats();
    
    return {
      totalPatients,
      inTreatment,
      criticalCases,
      recovered,
      conditionsStats,
      departmentsStats
    };
  }

  getConditionsStats(): any[] {
    const conditions = ['Diabetes', 'Heart Condition', 'Kidney Disease', 'Emergency'];
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#F44336'];
    
    return conditions.map((condition, index) => {
      const count = this.allPatients.filter(p => p.condition === condition).length;
      const percentage = (count / this.allPatients.length) * 100;
      return {
        name: condition,
        count: count,
        percentage: percentage,
        color: colors[index]
      };
    });
  }

  getDepartmentsStats(): any[] {
    const departments = ['Cardiology', 'Endocrinology', 'Nephrology', 'Emergency', 'Neurology'];
    const counts = departments.map(dept => 
      this.allPatients.filter(p => p.department === dept).length
    );
    
    return departments.map((dept, index) => ({
      name: dept,
      count: counts[index],
      percentage: (counts[index] / this.allPatients.length) * 100
    }));
  }

  // الإحصائيات
  getPatientsByStatus(status: string): number {
    return this.allPatients.filter(patient => patient.status === status).length;
  }

  // البحث المتقدم
  searchPatients(): void {
    this.isSearching = true;
    
    setTimeout(() => {
      if (!this.searchTerm.trim()) {
        this.patients = [...this.allPatients];
      } else {
        const term = this.searchTerm.toLowerCase().trim();
        this.patients = this.allPatients.filter(patient => {
          const textMatch = 
            patient.name.toLowerCase().includes(term) ||
            patient.condition.toLowerCase().includes(term) ||
            patient.email.toLowerCase().includes(term) ||
            patient.status.toLowerCase().includes(term) ||
            patient.department.toLowerCase().includes(term) ||
            patient.doctor.toLowerCase().includes(term);
          
          const dateMatch = patient.lastVisit.includes(term);
          
          return textMatch || dateMatch;
        });
      }
      this.isSearching = false;
    }, 300);
  }

  applyFilters(): void {
    let filteredPatients = [...this.allPatients];

    if (this.filters.status) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.status === this.filters.status
      );
    }

    if (this.filters.condition) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.condition === this.filters.condition
      );
    }

    if (this.filters.department) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.department === this.filters.department
      );
    }

    if (this.filters.ageRange) {
      const [minAge, maxAge] = this.filters.ageRange.split('-').map(Number);
      filteredPatients = filteredPatients.filter(patient => 
        patient.age >= minAge && patient.age <= maxAge
      );
    }

    if (this.filters.visitDate) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.lastVisit === this.filters.visitDate
      );
    }

    this.patients = filteredPatients;
  }

  resetFilters(): void {
    this.filters = { status: '', condition: '', ageRange: '', visitDate: '', department: '' };
    this.searchTerm = '';
    this.patients = [...this.allPatients];
  }

  // الـSorting Functions
  toggleSort(): void {
    this.showSortOptions = !this.showSortOptions;
  }

  sortPatients(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.patients = [...this.patients].sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue == null && bValue == null) return 0;
      
      if (field === 'age') {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      }
      else if (field === 'lastVisit') {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      else {
        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    this.showSortOptions = false;
  }

  // الـAuto-complete
  getSearchSuggestions(): any[] {
    if (!this.searchTerm.trim()) return [];
    
    const term = this.searchTerm.toLowerCase();
    return this.allPatients
      .filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.condition.toLowerCase().includes(term) ||
        patient.lastVisit.includes(term) ||
        patient.department.toLowerCase().includes(term)
      )
      .slice(0, 5);
  }

  selectSuggestion(patient: Patient): void {
    this.searchTerm = patient.name;
    this.searchPatients();
    this.showSuggestions = false;
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchPatients();
  }

  // تفاصيل المريض
  viewPatientDetails(patient: Patient): void {
    this.selectedPatient = patient;
    this.showPatientDetails = true;
    this.activeTab = 'info';
  }

  closePatientDetails(): void {
    this.selectedPatient = null;
    this.showPatientDetails = false;
  }

  getTreatmentPlan(condition: string): string {
    const plans: any = {
      'Diabetes': 'Insulin therapy, diet control, regular monitoring and lifestyle modifications',
      'Heart Condition': 'Medication regimen, lifestyle changes, regular cardiac checkups',
      'Kidney Disease': 'Dialysis schedule, medication management, specialized diet plan',
      'Emergency': 'Immediate care protocol, continuous monitoring, follow-up treatment plan'
    };
    return plans[condition] || 'Standard medical treatment and monitoring plan';
  }

  getTreatmentDetails(condition: string): any[] {
    const treatments: any = {
      'Diabetes': [
        { medication: 'Insulin Glargine', dosage: '10 units daily', schedule: 'Before breakfast' },
        { medication: 'Metformin', dosage: '500mg', schedule: 'Twice daily with meals' },
        { medication: 'Blood Sugar Monitor', dosage: 'As needed', schedule: '4 times daily' }
      ],
      'Heart Condition': [
        { medication: 'Aspirin', dosage: '81mg', schedule: 'Once daily' },
        { medication: 'Beta Blocker', dosage: '25mg', schedule: 'Twice daily' },
        { medication: 'ACE Inhibitor', dosage: '10mg', schedule: 'Once daily' }
      ],
      'Kidney Disease': [
        { medication: 'Diuretic', dosage: '40mg', schedule: 'Once daily' },
        { medication: 'ACE Inhibitor', dosage: '10mg', schedule: 'Once daily' },
        { medication: 'Dialysis', dosage: 'Session', schedule: '3 times weekly' }
      ],
      'Emergency': [
        { medication: 'Pain Management', dosage: 'As needed', schedule: 'Every 6 hours' },
        { medication: 'Antibiotic', dosage: '500mg', schedule: 'Three times daily' },
        { medication: 'IV Fluids', dosage: 'Continuous', schedule: 'As prescribed' }
      ]
    };
    return treatments[condition] || [{ medication: 'General Care', dosage: 'As prescribed', schedule: 'Regular intervals' }];
  }

  getMedicalHistory(patientId: number): any[] {
    const history: any = {
      1: [
        { date: '2025-10-15', type: 'Regular Checkup', description: 'Routine diabetes monitoring and medication adjustment', doctor: 'Smith' },
        { date: '2025-09-20', type: 'Lab Test', description: 'Comprehensive blood sugar levels and HbA1c test', doctor: 'Johnson' },
        { date: '2025-08-10', type: 'Consultation', description: 'Diet and medication adjustment based on recent results', doctor: 'Smith' }
      ],
      2: [
        { date: '2025-10-28', type: 'Cardiology Checkup', description: 'Comprehensive heart function evaluation and ECG', doctor: 'Brown' },
        { date: '2025-09-15', type: 'ECG Test', description: 'Electrocardiogram performed with stress test', doctor: 'Brown' },
        { date: '2025-07-22', type: 'Recovery Assessment', description: 'Post-treatment recovery check and progress evaluation', doctor: 'Wilson' }
      ],
      3: [
        { date: '2025-09-30', type: 'Emergency Visit', description: 'Critical kidney function issues requiring immediate attention', doctor: 'Davis' },
        { date: '2025-08-15', type: 'Dialysis', description: 'Regular dialysis session with medication adjustment', doctor: 'Davis' },
        { date: '2025-07-01', type: 'Consultation', description: 'Comprehensive treatment plan discussion and adjustments', doctor: 'Davis' }
      ],
      4: [
        { date: '2025-10-28', type: 'Emergency Admission', description: 'Acute emergency care with continuous monitoring', doctor: 'Miller' },
        { date: '2025-09-10', type: 'Follow-up', description: 'Post-emergency evaluation and recovery assessment', doctor: 'Miller' }
      ]
    };
    return history[patientId] || [
      { date: '2025-01-01', type: 'Initial Visit', description: 'First patient consultation and medical assessment', doctor: 'General Physician' }
    ];
  }

  getPatientDocuments(patientId: number): any[] {
    const documents: any = {
      1: [
        { name: 'Blood Test Results.pdf', date: '2025-10-16', type: 'Lab Results' },
        { name: 'Medical Report.docx', date: '2025-09-21', type: 'Medical Report' },
        { name: 'Prescription Details.pdf', date: '2025-08-15', type: 'Prescription' }
      ],
      2: [
        { name: 'ECG Report.pdf', date: '2025-10-29', type: 'Diagnostic' },
        { name: 'Cardiology Summary.docx', date: '2025-09-16', type: 'Medical Report' },
        { name: 'Treatment Plan.pdf', date: '2025-07-25', type: 'Treatment Plan' }
      ]
    };
    return documents[patientId] || [
      { name: 'Medical Record.pdf', date: '2025-01-01', type: 'Medical Record' }
    ];
  }
}