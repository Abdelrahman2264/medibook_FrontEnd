import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

// مهم جداً !!
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from "./components/footer/footer.component";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FloatingButtonsComponent } from './components/floating-buttons/floating-buttons.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { SidebarService } from './services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    FloatingButtonsComponent,
    NotificationsComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  isAuthenticated = false;
  showHeader = false;
  showSidebar = false;
  isSidebarCollapsed = false;

  // Routes that should show header (public routes)
  private publicRoutes = ['/signin', '/signup', '/about', '/contact', '/'];
  private sidebarSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    // Check initial auth state
    this.updateAuthState();

    // Subscribe to auth changes
    this.authService.token$.subscribe(() => {
      this.updateAuthState();
    });

    // Subscribe to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateAuthState();
      });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isSidebarCollapsed = !isOpen;
    });

    // Initialize sidebar state
    this.isSidebarCollapsed = !this.sidebarService.isSidebarOpen();
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  private updateAuthState() {
    this.isAuthenticated = this.authService.isAuthenticated();
    const currentRoute = this.router.url;

    // Check if current route is public (exact match or starts with)
    const isPublicRoute = this.publicRoutes.some(route => {
      if (route === '/') {
        return currentRoute === '/' || currentRoute === '';
      }
      return currentRoute === route || currentRoute.startsWith(route + '/');
    });

    // Show header for public routes or when not authenticated
    this.showHeader = !this.isAuthenticated || isPublicRoute;
    
    // Show sidebar for authenticated users on protected routes
    this.showSidebar = this.isAuthenticated && !isPublicRoute;
  }
}
