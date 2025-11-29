import { Routes } from '@angular/router';
import { AppointmentsComponent } from './components/appointment/appointments.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact us/contact.component'; 
import { Patients } from './components/patient/patients.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BookAppointmentComponent } from './components/book-appointment/book-appointment.component';
import { AssignAppointmentComponent } from './components/assign-appointment/assign-appointment.component';
import { HomeComponent } from './components/Home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes (no auth required)
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'home',
    component: HomeComponent
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

  // Protected routes (auth required)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./components/appointment/appointments.component').then(m => m.AppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments/:id',
    loadComponent: () =>
      import('./components/appointment-details/appointment-details.component').then(m => m.AppointmentDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'book-appointment',
    loadComponent: () =>
      import('./components/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'assign-appointment/:id',
    loadComponent: () =>
      import('./components/assign-appointment/assign-appointment.component').then(m => m.AssignAppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./components/doctors/doctors.component').then(m => m.DoctorsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors/:id',
    loadComponent: () =>
      import('./components/doctor-profile/doctor-profile.component')
        .then(m => m.DoctorProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctors/:id/edit',
    loadComponent: () =>
      import('./components/doctor-edit/doctor-edit.component')
        .then(m => m.DoctorEditComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nurses',
    loadComponent: () =>
      import('./components/nurses/nurses.component').then(m => m.Nurses),
    canActivate: [authGuard]
  },
  {
    path: 'nurses/:id',
    loadComponent: () =>
      import('./components/nurse-profile/nurse-profile.component')
        .then(m => m.NurseProfile),
    canActivate: [authGuard]
  },
  {
    path: 'patients',
    loadComponent: () =>
      import('./components/patient/patients.component').then(m => m.Patients),
    canActivate: [authGuard]
  },
  {
    path: 'patients/:id',
    loadComponent: () =>
      import('./components/patient-profile/patient-profile.component')
        .then(m => m.PatientProfile),
    canActivate: [authGuard]
  },
  {
    path: 'lists',
    loadComponent: () =>
      import('./components/lists/lists.component').then(m => m.ListsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./components/rooms/rooms.component').then(m => m.Rooms),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./components/user-profile/user-profile.component').then(m => m.UserProfile),
    canActivate: [authGuard]
  },
  {
    path: 'feedbacks',
    loadComponent: () =>
      import('./components/feedbacks/feedbacks.component').then(m => m.FeedbacksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admins',
    loadComponent: () =>
      import('./components/admins/admins.component')
        .then(m => m.Admins),
    canActivate: [authGuard]
  },
  {
    path: 'admins/:id',
    loadComponent: () =>
      import('./components/admin-profile/admin-profile.component')
        .then(m => m.AdminProfile),
    canActivate: [authGuard]
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./components/table/table.component').then(m => m.TableComponent),
    canActivate: [authGuard]
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./components/feedback/feedback.component').then(m => m.FeedbackComponent),
    canActivate: [authGuard]
  },

  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];