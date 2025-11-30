import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';
import { SidebarService } from '../../services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  isSidebarOpen: boolean = true;
  
  private themeSubscription?: Subscription;
  private sidebarSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });

    // Initialize current values
    this.currentTheme = this.themeService.getCurrentTheme();
    this.isSidebarOpen = this.sidebarService.isSidebarOpen();
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
    this.sidebarSubscription?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  getThemeIcon(): string {
    return this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
  }

  getSidebarIcon(): string {
    return this.isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right';
  }
}

