import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { SidebarService } from '../../services/sidebar.service';
import { filter, Subscription } from 'rxjs';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  active: boolean;
  isQuickAction?: boolean; // For quick action items like signout, home, etc.
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
  roleLoaded: boolean = false;
  isMobileView: boolean = false;
  sidebarExpandedMobile: boolean = false;
  
  private routerSubscription?: Subscription;
  private sidebarSubscription?: Subscription;
  private roleSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private roleService: RoleService,
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check if mobile initially
    this.checkMobileView();
    
    // First try to get from storage (for immediate display)
    this.currentUser = this.authService.getCurrentUser();
    this.setActiveMenuByRoute();
    
    // Try to get stored role immediately
    const storedRole = this.roleService.getCurrentRole();
    if (storedRole) {
      // Role is available immediately from storage
      this.roleLoaded = true;
      this.updateMenuItems();
      this.preloadDataByRole();
    }
    
    // Subscribe to role changes FIRST to ensure we wait for role to load
    this.roleSubscription = this.roleService.getCurrentRole$().subscribe(role => {
      if (role && !this.roleLoaded) {
        // Role is now loaded - update menu items only when role is available
        this.roleLoaded = true;
        this.updateMenuItems();
        // Preload data in background based on role
        this.preloadDataByRole();
        this.cdr.detectChanges();
      } else if (role && this.roleLoaded) {
        // Role changed, update menu items
        this.updateMenuItems();
        this.cdr.detectChanges();
      }
    });
    
    // Then load from API to get latest data
    this.loadCurrentUser();
    this.loadCurrentRole();

    // Build initial menu immediately to avoid showing the loading skeleton
    // while the role is being fetched. The menu will refresh when the role
    // observable emits a definitive value.
    this.updateMenuItems();
    
    // Subscribe to route changes to update active menu
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveMenuByRoute();
        // Also update menu items in case authentication state changed
        if (this.roleLoaded) {
          this.updateMenuItems();
        }
        // Close mobile sidebar on navigation
        if (this.isMobileView && this.sidebarExpandedMobile) {
          this.closeMobileSidebar();
        }
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
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
    // Clean up body style
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkMobileView();
  }

  checkMobileView() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth <= 768;
    
    // If switching from mobile to desktop and sidebar is expanded, close it
    if (wasMobile && !this.isMobileView && this.sidebarExpandedMobile) {
      this.sidebarExpandedMobile = false;
      document.body.style.overflow = '';
    }
    
    this.cdr.detectChanges();
  }

  getSidebarClasses(): any {
    return {
      'sidebar': true,
      'sidebar-collapsed': !this.isSidebarOpen && !this.isMobileView,
      'sidebar-expanded-mobile': this.sidebarExpandedMobile && this.isMobileView
    };
  }

  closeMobileSidebar() {
    if (this.isMobileView && this.sidebarExpandedMobile) {
      this.sidebarExpandedMobile = false;
      document.body.style.overflow = '';
      this.cdr.detectChanges();
    }
  }

  /**
   * Update menu items based on current role
   * This method builds a reasonable default immediately (to avoid a persistent loading spinner)
   * and then refreshes when the real role becomes available.
   */
  updateMenuItems() {
    const role = this.roleService.getCurrentRole();
    const isAuthenticated = this.authService.isAuthenticated();

    // If role is not yet loaded but user is authenticated, assume the minimal 'user' role
    // for the initial menu render to avoid leaking admin items. When the real role
    // arrives the subscription will refresh the menu.
    let effectiveRole: string | null = role;
    if (!effectiveRole) {
      effectiveRole = isAuthenticated ? 'user' : null;
    }

    const isUser = effectiveRole === 'user';
    const isDoctor = effectiveRole === 'doctor';
    const isNurse = effectiveRole === 'nurse';

    console.log('🔄 Updating menu items for effectiveRole:', effectiveRole, {isUser, isDoctor, isNurse, isAuthenticated});

    // Base menu items (main navigation)
    const allMenuItems: MenuItem[] = [
      { name: 'Dashboard', icon: 'fas fa-chart-line', route: '/dashboard', active: false },
      { name: 'Appointments', icon: 'fas fa-calendar-check', route: '/appointments', active: false, isQuickAction: true },
      { name: 'Doctors', icon: 'fas fa-user-md', route: '/doctors', active: false },
      { name: 'Nurses', icon: 'fas fa-user-nurse', route: '/nurses', active: false },
      { name: 'Patients', icon: 'fas fa-user-injured', route: '/patients', active: false },
      { name: 'Admins', icon: 'fas fa-user-shield', route: '/admins', active: false },
      { name: 'Rooms', icon: 'fas fa-door-open', route: '/rooms', active: false },
      { name: 'Reports', icon: 'fas fa-file-alt', route: '/reports', active: false },
      { name: 'Profile', icon: 'fas fa-user', route: '/user-profile', active: false },
      { name: 'Feedbacks', icon: 'fas fa-comments', route: '/feedbacks', active: false }
    ];
    
    // Quick action items (only shown when authenticated)
    // Keep Home separate so we can place it as the first menu item
    const homeItem: MenuItem = { name: 'Home', icon: 'fas fa-home', route: '/home', active: false, isQuickAction: true };

    const quickActionItems: MenuItem[] = [
      { name: 'About', icon: 'fas fa-info-circle', route: '/about', active: false, isQuickAction: true },
      { name: 'Contact Us', icon: 'fas fa-envelope', route: '/contact', active: false, isQuickAction: true },
      { name: 'Meet Our Team', icon: 'fas fa-users', route: '/about', active: false, isQuickAction: true }, // Navigate to about page with team section
      { name: 'Signout', icon: 'fas fa-sign-out-alt', route: '/signout', active: false, isQuickAction: true }
    ];
    
    // Filter menu items based on effective role
    let filteredMenuItems: MenuItem[] = [];
    if (!effectiveRole) {
      // Not authenticated: show a minimal public menu
      filteredMenuItems = allMenuItems.filter(item => 
        item.name === 'Doctors' || item.name === 'About' || item.name === 'Contact Us' || item.name === 'Profile' || item.name === 'Feedbacks'
      );
    } else if (isUser) {
      // Authenticated patient/user: hide Dashboard and admin pages
      filteredMenuItems = allMenuItems.filter(item => 
        item.name !== 'Dashboard' && 
        item.name !== 'Patients' && 
        item.name !== 'Rooms' && 
        item.name !== 'Reports' &&
        item.name !== 'Admins'
      );
    } else if (isDoctor) {
      // Doctor role: hide Reports only
      filteredMenuItems = allMenuItems.filter(item => item.name !== 'Reports');
    } else if (isNurse) {
      // Nurse role: hide Reports only
      filteredMenuItems = allMenuItems.filter(item => item.name !== 'Reports');
    } else {
      // Admin or other: show all items
      filteredMenuItems = allMenuItems;
    }
    
    // Remove Unauthorized page if it exists
    filteredMenuItems = filteredMenuItems.filter(item => 
      item.name !== 'Unauthorized' && item.route !== '/unauthorized'
    );
    
    // Place Home as the first item in the sidebar, then the filtered main items,
    // and keep About/Contact/Meet Our Team/Signout at the end as quick actions.
    if (isAuthenticated) {
      this.menuItems = [homeItem, ...filteredMenuItems, ...quickActionItems];
    } else {
      // Even for anonymous users, show Home first and then the rest
      this.menuItems = [homeItem, ...filteredMenuItems];
    }
    
    console.log('📋 Menu items updated:', this.menuItems.map(m => m.name));
    
    // Restore active state
    this.setActiveMenuByRoute();
    this.cdr.detectChanges();
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
          item.route === '/user-profile' || item.route === '/admins' ||
          item.route === '/home' || item.route === '/about' || item.route === '/contact') {
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
      '/admins',
      '/home',
      '/about',
      '/contact'
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

  /**
   * Handle quick action navigation
   */
  handleQuickAction(item: MenuItem) {
    if (item.name === 'Signout') {
      this.signOut();
    } else if (item.name === 'Meet Our Team') {
      // Navigate to about page and scroll to team section
      this.router.navigate(['/about']).then(() => {
        // Scroll to team section after navigation
        setTimeout(() => {
          const teamSection = document.querySelector('.team-section');
          if (teamSection) {
            teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      });
    } else {
      // Regular navigation for other quick actions
      this.router.navigate([item.route]);
    }
    
    // Close mobile sidebar if open
    if (this.isMobileView && this.sidebarExpandedMobile) {
      this.closeMobileSidebar();
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
    if (this.isMobileView) {
      this.sidebarExpandedMobile = !this.sidebarExpandedMobile;
      // Toggle body scroll when sidebar is expanded on mobile
      document.body.style.overflow = this.sidebarExpandedMobile ? 'hidden' : '';
    } else {
      this.sidebarService.toggleSidebar();
    }
    this.cdr.detectChanges();
  }

  getSidebarIcon(): string {
    if (this.isMobileView) {
      return this.sidebarExpandedMobile ? 'fa-times' : 'fa-bars';
    }
    return this.isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right';
  }

  /**
   * Preload data in background based on user role
   * This ensures data is ready when users navigate to pages
   */
  private preloadDataByRole() {
    const role = this.roleService.getCurrentRole();
    const isUser = this.roleService.isUser();
    const isDoctor = this.roleService.isDoctor();
    const isNurse = this.roleService.isNurse();
    const isAdmin = this.roleService.isAdmin();
    
    console.log('🔄 Preloading data in background for role:', role);
    
    // Use setTimeout to defer loading and not block UI
    setTimeout(() => {
      if (isUser) {
        // Patients: preload appointments, doctors, feedback
        console.log('⏳ Preloading data for Patient role...');
        // Data will be loaded when user navigates to these pages
      } else if (isDoctor) {
        // Doctors: preload appointments, patients, rooms, nurses
        console.log('⏳ Preloading data for Doctor role...');
        // Data will be loaded when doctor navigates to these pages
      } else if (isNurse) {
        // Nurses: preload appointments, rooms, patients
        console.log('⏳ Preloading data for Nurse role...');
        // Data will be loaded when nurse navigates to these pages
      } else if (isAdmin) {
        // Admins: preload all critical data
        console.log('⏳ Preloading data for Admin role...');
        // Data will be loaded when admin navigates to these pages
      }
      
      console.log('✅ Background preload initiated for role:', role);
    }, 100);
  }
}