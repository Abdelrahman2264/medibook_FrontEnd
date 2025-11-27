import { Routes } from '@angular/router';
import { AppointmentsComponent } from './components/appointment/appointments.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact us/contact.component'; 
import { PatientListComponent } from './components/patient/patient-list.component';
import { SettingsComponent } from './components/settings/settings.component';
import {HomeComponent} from './components/Home/home.component';

export const routes: Routes = [
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
    redirectTo: 'appointments',
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
