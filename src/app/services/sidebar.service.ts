import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private readonly SIDEBAR_KEY = 'app-sidebar-state';
  private isOpenSubject: BehaviorSubject<boolean>;
  public isOpen$: Observable<boolean>;

  constructor() {
    // Get initial state from localStorage or default to true (open)
    const savedState = this.getSavedState();
    this.isOpenSubject = new BehaviorSubject<boolean>(savedState);
    this.isOpen$ = this.isOpenSubject.asObservable();
  }

  /**
   * Get current sidebar state
   */
  isSidebarOpen(): boolean {
    return this.isOpenSubject.value;
  }

  /**
   * Toggle sidebar open/closed
   */
  toggleSidebar(): void {
    const newState = !this.isOpenSubject.value;
    this.setSidebarOpen(newState);
  }

  /**
   * Open sidebar
   */
  openSidebar(): void {
    this.setSidebarOpen(true);
  }

  /**
   * Close sidebar
   */
  closeSidebar(): void {
    this.setSidebarOpen(false);
  }

  /**
   * Set sidebar state
   */
  setSidebarOpen(isOpen: boolean): void {
    this.isOpenSubject.next(isOpen);
    this.saveState(isOpen);
  }

  /**
   * Save sidebar state to localStorage
   */
  private saveState(isOpen: boolean): void {
    try {
      localStorage.setItem(this.SIDEBAR_KEY, JSON.stringify(isOpen));
    } catch (error) {
      console.error('Failed to save sidebar state to localStorage:', error);
    }
  }

  /**
   * Get saved sidebar state from localStorage
   */
  private getSavedState(): boolean {
    try {
      const saved = localStorage.getItem(this.SIDEBAR_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to read sidebar state from localStorage:', error);
    }
    
    // Default to open
    return true;
  }
}

