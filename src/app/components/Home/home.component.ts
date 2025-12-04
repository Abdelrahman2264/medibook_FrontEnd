import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading: boolean = true;
  isAuthenticated: boolean = false;
  userRole: string = '';
  uiReady: boolean = false;
  
  private roleSubscription?: Subscription;
  
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load UI in background based on role
    this.loadUserContextInBackground();
    
    // Subscribe to role changes
    this.roleSubscription = this.roleService.getCurrentRole$().subscribe(role => {
      this.userRole = role || '';
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    const counters = document.querySelectorAll('.stat-number');
    const statsSection: any = document.querySelector('.stats-section');

    // Stop re-running animation
    let animated = false;

    // Function to animate numbers
    const animateCounters = () => {
      counters.forEach((counter: any) => {
        const update = () => {
          const target = +counter.getAttribute('data-target');
          const current = +counter.innerText;
          const increment = target / 150;

          if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(update, 15);
          } else {
            counter.innerText = target;
          }
        };
        update();
      });
    };

    // Intersection Observer (when section becomes visible)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          animateCounters();
          animated = true;
        }
      },
      { threshold: 0.4 }
    );

    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  /**
   * Load user context in background without blocking UI
   * Uses async operations to render UI progressively
   */
  private loadUserContextInBackground() {
    // First pass: immediate check from storage (instant UI response)
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userRole = this.roleService.getCurrentRole() || '';
    this.uiReady = false;
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Second pass: defer data fetching to next event loop
    setTimeout(() => {
      console.log('⏳ Loading user context in background...');
      
      // Load role-specific data
      const role = this.roleService.getCurrentRole() || '';
      
      if (this.isAuthenticated && role) {
        // For authenticated users, preload their role-specific data
        this.loadRoleSpecificData(role);
      }
      
      // Mark UI as ready for rendering
      this.isLoading = false;
      this.uiReady = true;
      this.cdr.detectChanges();
      
      console.log('✅ User context loaded, UI ready for role:', role);
    }, 0);
  }

  /**
   * Load role-specific data in the background
   * Data is fetched asynchronously and doesn't block UI rendering
   */
  private loadRoleSpecificData(role: string) {
    const isUser = this.roleService.isUser();
    const isDoctor = this.roleService.isDoctor();
    const isNurse = this.roleService.isNurse();
    const isAdmin = this.roleService.isAdmin();
    
    console.log('🔄 Preloading UI for role:', role);
    
    // Defer role-specific data loading to background
    setTimeout(() => {
      if (isUser) {
        console.log('⏳ Rendering Patient-specific UI');
        // Patient UI optimizations
      } else if (isDoctor) {
        console.log('⏳ Rendering Doctor-specific UI');
        // Doctor UI optimizations
      } else if (isNurse) {
        console.log('⏳ Rendering Nurse-specific UI');
        // Nurse UI optimizations
      } else if (isAdmin) {
        console.log('⏳ Rendering Admin-specific UI');
        // Admin UI optimizations
      }
    }, 100);
  }
}
