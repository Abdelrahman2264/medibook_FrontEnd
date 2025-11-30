import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    // Get initial theme from localStorage or default to 'light'
    const savedTheme = this.getSavedTheme();
    this.themeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.theme$ = this.themeSubject.asObservable();
    
    // Apply theme on initialization
    this.applyTheme(savedTheme);
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Also update body class for additional styling if needed
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    
    console.log(`🎨 Theme changed to: ${theme}`);
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): Theme {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      console.error('Failed to read theme from localStorage:', error);
    }
    
    // Default to light theme
    return 'light';
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  /**
   * Check if current theme is light
   */
  isLightTheme(): boolean {
    return this.getCurrentTheme() === 'light';
  }
}

