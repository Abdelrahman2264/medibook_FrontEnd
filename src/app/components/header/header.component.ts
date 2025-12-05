import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule], 
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  title = 'Medibook';
  isDarkTheme = false;
  isAuthenticated = false;
  currentUser: any = null;
  
  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
    
    // Set initial theme state
    this.isDarkTheme = this.themeService.isDarkTheme();
    
    // Check initial auth state
    this.updateAuthState();
    
    // Subscribe to auth changes
    this.authSubscription = this.authService.token$.subscribe(() => {
      this.updateAuthState();
    });
    
    // Subscribe to route changes
    this.router.events.subscribe(() => {
      this.updateAuthState();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  updateAuthState() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getCurrentUser();
      // If user not in storage, fetch from API
      if (!this.currentUser) {
        this.userSubscription = this.userService.getCurrentUser().subscribe({
          next: (user) => {
            this.currentUser = user;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error fetching current user:', error);
          }
        });
      }
    } else {
      this.currentUser = null;
    }
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/signin']);
  }

  goToProfile() {
    const userId = this.currentUser?.id || this.currentUser?.userId;
    if (userId) {
      this.router.navigate(['/user-profile', userId]);
    } else {
      this.router.navigate(['/user-profile']);
    }
  }
}