import { Routes } from '@angular/router';
import { AppointmentsComponent } from './components/appointment/appointments.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact us/contact.component'; 
import { Patients } from './components/patient/patients.component';
import { SettingsComponent } from './components/settings/settings.component';
<<<<<<< HEAD
import {HomeComponent} from './components/Home/home.component';
=======
import { authGuard } from './guards/auth.guard';

>>>>>>> b5beda4 (Accept merge  keep current changes)

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
<<<<<<< HEAD
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'doctors',
    loadComponent: () =>
      import('./components/doctors/doctors.component').then(m => m.DoctorsCompomemt)
  },
  {
    path: 'doctors/:id',
    loadComponent: () =>
      import('./components/doctor-profile/doctor-profile.component')
        .then(m => m.DoctorProfile)
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
    component: PatientListComponent 
  },
  { 
    path: 'settings', 
    component: SettingsComponent 
  },

  {
=======
>>>>>>> b5beda4 (Accept merge  keep current changes)
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
    component: AppointmentsComponent,
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
    component: Patients,
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
    component: SettingsComponent,
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

  // Default redirect
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },{
  path: 'table',
  loadComponent: () =>
    import('./components/table/table.component').then(m => m.TableComponent)
},
{
  path: 'feedback',
  loadComponent: () =>
    import('./components/feedback/feedback.component').then(m => m.FeedbackComponent)
}


];
