import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'fas fa-chart-line', route: '/dashboard', active: false },
    { name: 'Appointments', icon: 'fas fa-calendar-check', route: '/appointments', active: false },
    { name: 'Doctors', icon: 'fas fa-user-md', route: '/doctors', active: false },
    { name: 'Nurses', icon: 'fas fa-user-nurse', route: '/nurses', active: false },
    { name: 'Patients', icon: 'fas fa-user-injured', route: '/patients', active: false },
    { name: 'Admins', icon: 'fas fa-user-shield', route: '/admins', active: false },
    { name: 'Lists', icon: 'fas fa-list', route: '/lists', active: false },
    { name: 'Rooms', icon: 'fas fa-door-open', route: '/rooms', active: false },
    { name: 'Reports', icon: 'fas fa-file-alt', route: '/reports', active: false },
    { name: 'Profile', icon: 'fas fa-user', route: '/user-profile', active: false },
    { name: 'Feedbacks', icon: 'fas fa-comments', route: '/feedbacks', active: false },
    { name: 'Settings', icon: 'fas fa-cog', route: '/settings', active: false },
    { name: 'Signout', icon: 'fas fa-sign-out-alt', route: '/signout', active: false }
  ];

  currentUser: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.setActiveMenuByRoute();
  }

  setActiveMenuByRoute() {
    const currentRoute = this.router.url;
    this.menuItems.forEach(item => {
      item.active = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
    });
  }

  setActiveMenu(item: MenuItem) {
    if (item.name === 'Signout') {
      this.signOut();
      return;
    }
    
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
    this.router.navigate([item.route]);
  }

  signOut() {
    this.authService.logoutAndRedirect();
  }

  getCurrentDay(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getUserName(): string {
    return this.currentUser?.name || this.currentUser?.fullName || 'User';
  }

  getUserRole(): string {
    return this.currentUser?.role || 'User';
  }

  getUserPhoto(): string {
    return this.currentUser?.photo || 'https://randomuser.me/api/portraits/men/75.jpg';
  }
}



