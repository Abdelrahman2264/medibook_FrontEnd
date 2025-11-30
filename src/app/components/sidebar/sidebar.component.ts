import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { SidebarService } from '../../services/sidebar.service';
import { filter, Subscription } from 'rxjs';

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
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'fas fa-chart-line', route: '/dashboard', active: false },
    { name: 'Appointments', icon: 'fas fa-calendar-check', route: '/appointments', active: false },
    { name: 'Doctors', icon: 'fas fa-user-md', route: '/doctors', active: false },
    { name: 'Nurses', icon: 'fas fa-user-nurse', route: '/nurses', active: false },
    { name: 'Patients', icon: 'fas fa-user-injured', route: '/patients', active: false },
    { name: 'Admins', icon: 'fas fa-user-shield', route: '/admins', active: false },
    { name: 'Rooms', icon: 'fas fa-door-open', route: '/rooms', active: false },
    { name: 'Reports', icon: 'fas fa-file-alt', route: '/reports', active: false },
    { name: 'Profile', icon: 'fas fa-user', route: '/user-profile', active: false },
    { name: 'Feedbacks', icon: 'fas fa-comments', route: '/feedbacks', active: false },
    { name: 'Signout', icon: 'fas fa-sign-out-alt', route: '/signout', active: false }
  ];

  currentUser: any = null;
  currentRole: string = 'User';
  isSidebarOpen: boolean = true;
  private routerSubscription?: Subscription;
  private sidebarSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // First try to get from storage (for immediate display)
    this.currentUser = this.authService.getCurrentUser();
    this.setActiveMenuByRoute();
    
    // Then load from API to get latest data
    this.loadCurrentUser();
    this.loadCurrentRole();
    
    // Subscribe to route changes to update active menu
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveMenuByRoute();
      });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
      this.cdr.detectChanges();
    });

    // Initialize sidebar state
    this.isSidebarOpen = this.sidebarService.isSidebarOpen();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  loadCurrentUser() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
        }
      },
      error: (error) => {
        console.error('Error loading current user:', error);
        // Fallback to stored user if API call fails
        if (!this.currentUser) {
          this.currentUser = this.authService.getCurrentUser();
        }
      }
    });
  }

  loadCurrentRole() {
    this.userService.getCurrentRole().subscribe({
      next: (role: string) => {
        if (role) {
          // Capitalize first letter
          const newRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
          if (this.currentRole !== newRole) {
            this.currentRole = newRole;
            // Use setTimeout to avoid change detection error
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
          }
        }
      },
      error: (error) => {
        console.error('Error loading current role:', error);
        // Fallback to role from currentUser if available
        if (this.currentUser) {
          const roleFromUser = this.currentUser.role || this.currentUser.userRole;
          if (roleFromUser) {
            const newRole = roleFromUser.charAt(0).toUpperCase() + roleFromUser.slice(1).toLowerCase();
            if (this.currentRole !== newRole) {
              this.currentRole = newRole;
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            }
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    // Ensure change detection runs after view init
    this.cdr.detectChanges();
  }

  setActiveMenuByRoute() {
    const currentRoute = this.router.url.split('?')[0]; // Remove query params
    this.menuItems.forEach(item => {
      // Exact match for specific routes
      if (item.route === '/dashboard' || item.route === '/appointments' || 
          item.route === '/patients' || item.route === '/feedbacks' || 
          item.route === '/rooms' || item.route === '/reports' ||
          item.route === '/user-profile' || item.route === '/admins') {
        item.active = currentRoute === item.route;
      } else {
        // For routes with params (like /doctors/:id), check if it starts with the base route
        item.active = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
      }
    });
  }

  getRouterLinkActiveOptions(route: string): { exact: boolean } {
    // Routes that should match exactly
    const exactRoutes = [
      '/dashboard',
      '/appointments',
      '/patients',
      '/feedbacks',
      '/rooms',
      '/reports',
      '/user-profile',
      '/admins'
    ];
    
    return { exact: exactRoutes.includes(route) };
  }

  setActiveMenu(item: MenuItem) {
    // This method is kept for backward compatibility but routerLink handles navigation
    if (item.name === 'Signout') {
      this.signOut();
      return;
    }
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
    if (!this.currentUser) return 'User';
    // Handle different possible field names from API
    return this.currentUser.name || 
           this.currentUser.fullName || 
           `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() ||
           this.currentUser.email?.split('@')[0] ||
           'User';
  }

  getUserRole(): string {
    // Return the role loaded from API
    return this.currentRole || 'User';
  }

  getUserPhoto(): string {
    if (!this.currentUser) return 'https://randomuser.me/api/portraits/men/75.jpg';
    // Handle different possible field names from API
    let photo = this.currentUser.photo || 
                this.currentUser.profileImage || 
                this.currentUser.profilePhoto ||
                '';
    
    if (photo) {
      // If it's base64 but doesn't have data URL prefix, add it
      if (!photo.startsWith('data:') && !photo.startsWith('http')) {
        photo = `data:image/jpeg;base64,${photo}`;
      }
      return photo;
    }
    
    return 'https://randomuser.me/api/portraits/men/75.jpg';
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  getSidebarIcon(): string {
    return this.isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right';
  }
}



