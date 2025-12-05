import { Routes } from '@angular/router';
import { AppointmentsComponent } from './components/appointment/appointments.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact us/contact.component'; 
import { Patients } from './components/patient/patients.component';
import { FeedbacksComponent } from './components/feedbacks/feedbacks.component';
import { AppointmentDetailsComponent } from './components/appointment-details/appointment-details.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';


export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['admin', 'doctor', 'nurse'] }
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
        .then(m => m.DoctorProfileComponent),
    canActivate: [authGuard]
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
        .then(m => m.NurseProfile),
    canActivate: [authGuard]
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./components/user-profile/user-profile.component').then(m => m.UserProfile)
  },
  { 
    path: 'patients', 
    component: Patients,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: ['admin', 'doctor', 'nurse'] }
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
        .then(m => m.AdminProfile),
    canActivate: [authGuard]
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./components/rooms/rooms.component').then(m => m.Rooms),
    canActivate: [authGuard, roleGuard],
    data: { requiresRoomsAccess: true }
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard, roleGuard],
    data: { requiresReportsAccess: true }
  },
  {
    path: 'assign-appointment/:id',
    loadComponent: () =>
      import('./components/assign-appointment/assign-appointment.component')
        .then(m => m.AssignAppointmentComponent),
    canActivate: [authGuard, roleGuard],
    data: { requiresManagement: true }
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
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
    path: 'home',
    loadComponent: () =>
      import('./components/Home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./components/meet-our-team/meet-our-team.component')
        .then(m => m.MeetOurTeamComponent)
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
        .then(m => m.SigninComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup/signup.component')
        .then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    redirectTo: '/signin',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/signin',
    pathMatch: 'full'
  }
];
