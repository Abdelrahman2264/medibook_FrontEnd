import { Routes } from '@angular/router';
import { AppointmentsComponent } from './components/appointment/appointments.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact us/contact.component'; 
import { Patients } from './components/patient/patients.component';
import { FeedbacksComponent } from './components/feedbacks/feedbacks.component';
import { AppointmentDetailsComponent } from './components/appointment-details/appointment-details.component';


export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'appointments',
    component: AppointmentsComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./components/doctors/doctors.component').then(m => m.DoctorsComponent)
  },
  {
    path: 'doctors/:id',
    loadComponent: () =>
      import('./components/doctor-profile/doctor-profile.component')
        .then(m => m.DoctorProfileComponent)
  },
  {
    path: 'nurses',
    loadComponent: () =>
      import('./components/nurses/nurses.component').then(m => m.Nurses)
  },
  {
    path: 'nurses/:id',
    loadComponent: () =>
      import('./components/nurse-profile/nurse-profile.component')
        .then(m => m.NurseProfile)
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./components/user-profile/user-profile.component').then(m => m.UserProfile)
  },
  { 
    path: 'patients', 
    component: Patients 
  },
  {
    path: 'patients/:id',
    loadComponent: () =>
      import('./components/patient-profile/patient-profile.component')
        .then(m => m.PatientProfile)
  },
  {
    path: 'admins',
    loadComponent: () =>
      import('./components/admins/admins.component').then(m => m.Admins)
  },
  {
    path: 'admins/:id',
    loadComponent: () =>
      import('./components/admin-profile/admin-profile.component')
        .then(m => m.AdminProfile)
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./components/rooms/rooms.component').then(m => m.Rooms)
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'feedbacks',
    component: FeedbacksComponent
  },
  {
    path: 'appointment-details/:id',
    component: AppointmentDetailsComponent
  },
  {
    path: 'book-appointment',
    loadComponent: () =>
      import('./components/book-appointment/book-appointment.component')
        .then(m => m.BookAppointmentComponent)
  },
  {
    path: 'assign-appointment/:id',
    loadComponent: () =>
      import('./components/assign-appointment/assign-appointment.component')
        .then(m => m.AssignAppointmentComponent)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/Home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./components/feedback/feedback.component')
        .then(m => m.FeedbackComponent)
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./components/signin/signin.component')
        .then(m => m.SigninComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signin/signup/signup.component')
        .then(m => m.SignupComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
