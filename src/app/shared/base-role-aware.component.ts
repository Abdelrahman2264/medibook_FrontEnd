import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { RoleService } from '../services/role.service';
import { Subscription } from 'rxjs';

/**
 * Base component for role-aware features
 * Ensures role is loaded before rendering role-dependent UI elements
 */
@Component({
  template: ''
})
export abstract class BaseRoleAwareComponent implements OnInit, OnDestroy {
  roleLoaded: boolean = false;
  protected roleSubscription?: Subscription;

  constructor(
    protected roleService: RoleService,
    protected cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Try to get stored role immediately
    const storedRole = this.roleService.getCurrentRole();
    if (storedRole) {
      // Role is available immediately from storage
      this.roleLoaded = true;
      this.onRoleLoaded(storedRole);
    }
    
    // Wait for role to be loaded before proceeding
    this.subscribeToRole();
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  /**
   * Subscribe to role changes and wait for role to be available
   */
  protected subscribeToRole() {
    this.roleSubscription = this.roleService.getCurrentRole$().subscribe(role => {
      if (role && !this.roleLoaded) {
        // Role is now loaded - mark as ready
        this.roleLoaded = true;
        console.log('✅ Role loaded in component:', role);
        this.onRoleLoaded(role);
        this.cdr.detectChanges();
      } else if (role && this.roleLoaded) {
        // Role changed, call hook again
        this.onRoleLoaded(role);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Override this method to perform actions after role is loaded
   */
  protected onRoleLoaded(role: string): void {
    // Override in child components
  }

  /**
   * Force change detection
   */
  protected forceUpdate() {
    this.cdr.detectChanges();
  }
}
