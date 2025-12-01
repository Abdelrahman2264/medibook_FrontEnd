import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { SidebarService } from './services/sidebar.service';
import { SignalRService } from './services/signalr.service';
import { Subscription } from 'rxjs';
import { NotificationDetailsDto } from './models/notification.model';

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
    NotificationsComponent,
    NotificationCardComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  isAuthenticated = false;
  showHeader = false;
  showSidebar = false;
  isSidebarCollapsed = false;
  
  // Real-time notifications
  realTimeNotifications: NotificationDetailsDto[] = [];
  private notificationSubscription?: Subscription;
  private authSubscription?: Subscription;

  // Routes that should show header (public routes)
  private publicRoutes = ['/signin', '/signup', '/about', '/contact', '/'];
  private sidebarSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private sidebarService: SidebarService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check initial auth state
    this.updateAuthState();

    // Subscribe to auth changes
    this.authSubscription = this.authService.token$.subscribe(() => {
      this.updateAuthState();
      // Reconnect SignalR when token changes
      if (this.authService.isAuthenticated()) {
        this.signalRService.reconnect();
      } else {
        this.signalRService.disconnect();
      }
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

    // Initialize SignalR for real-time notifications
    this.initializeSignalR();
  }

  private initializeSignalR(): void {
    // Connect to SignalR if authenticated
    if (this.authService.isAuthenticated()) {
      setTimeout(() => {
        this.signalRService.connect().then(() => {
          console.log('SignalR connected successfully');
        }).catch(error => {
          console.error('SignalR connection failed:', error);
        });
      }, 1000); // Wait a bit for auth to be fully ready
    }

    // Subscribe to real-time notifications from SignalR (actual notifications from database)
    this.notificationSubscription = this.signalRService.notification$.subscribe(notification => {
      console.log('🔔 Real-time notification received via SignalR:', notification);
      
      // Ensure notification has all required fields
      if (!notification || !notification.notificationId) {
        console.warn('Invalid notification received:', notification);
        return;
      }
      
      // Check if notification already exists (prevent duplicates)
      const exists = this.realTimeNotifications.some(n => n.notificationId === notification.notificationId);
      if (exists) {
        console.log('Notification already displayed, skipping:', notification.notificationId);
        return;
      }
      
      // Add notification to display
      this.realTimeNotifications.push(notification);
      console.log('📬 Notification card added. Total:', this.realTimeNotifications.length);
      
      // Force change detection to ensure rendering
      this.cdr.detectChanges();
      
      // Force change detection again after a short delay
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('✅ Notification card should be visible now. ID:', notification.notificationId);
      }, 100);
      
      // Remove notification after it's been displayed (auto-close)
      setTimeout(() => {
        const index = this.realTimeNotifications.findIndex(n => n.notificationId === notification.notificationId);
        if (index > -1) {
          this.realTimeNotifications.splice(index, 1);
          this.cdr.detectChanges();
          console.log('🗑️ Notification card removed. ID:', notification.notificationId);
        }
      }, 6000); // Remove after 6 seconds
    });
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.signalRService.disconnect();
  }

  removeNotification(notificationId: number): void {
    const index = this.realTimeNotifications.findIndex(n => n.notificationId === notificationId);
    if (index > -1) {
      this.realTimeNotifications.splice(index, 1);
      this.cdr.detectChanges();
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
