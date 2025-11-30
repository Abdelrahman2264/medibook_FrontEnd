import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.css']
})
export class FloatingButtonsComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  
  private themeSubscription?: Subscription;

  constructor(
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Initialize current value
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeIcon(): string {
    return this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
  }

  getThemeTitle(): string {
    return this.currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

