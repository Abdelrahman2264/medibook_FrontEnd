import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(private toastService: ToastService) {}
  
  activeTab: string = 'general';

  // User data
  userProfile = {
    name: 'Dr. Ahmed Mohamed',
    email: 'ahmed.mohamed@hospital.com',
    phone: '+201234567890',
    specialty: 'General Surgery',
    department: 'Surgical Department'
  };

  // Settings data
  settings = {
    general: {
      language: 'en',
      timezone: 'UTC+2',
      dateFormat: 'dd/MM/yyyy'
    },
    account: {
      username: 'drahmed2024',
      email: 'ahmed.mohamed@hospital.com',
      phone: '+201234567890'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      appointmentReminders: true
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessages: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      direction: 'ltr'
    }
  };

  // Tabs
  settingsTabs = [
    { id: 'general', name: 'General Settings', icon: 'settings' },
    { id: 'account', name: 'Account Settings', icon: 'person' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'privacy', name: 'Privacy', icon: 'lock' },
    { id: 'appearance', name: 'Appearance', icon: 'palette' }
  ];

  // Options
  languages = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' }
  ];

  timezones = [
    { value: 'UTC+2', label: 'UTC+2 (Egypt, Libya)' },
    { value: 'UTC+3', label: 'UTC+3 (Saudi Arabia, Jordan)' }
  ];

  themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'purple', label: 'Purple' }
  ];

  fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Save functions
  saveGeneralSettings(): void {
    console.log('General settings saved:', this.settings.general);
    this.applyGeneralSettings();
    this.toastService.success('General settings saved successfully');
  }

  saveAccountSettings(): void {
    console.log('Account settings saved:', this.settings.account);
    this.updateUserProfile();
    this.toastService.success('Account information updated successfully');
  }

  saveNotificationSettings(): void {
    console.log('Notification settings saved:', this.settings.notifications);
    this.applyNotificationSettings();
    this.toastService.success('Notification settings updated');
  }

  savePrivacySettings(): void {
    console.log('Privacy settings saved:', this.settings.privacy);
    this.applyPrivacySettings();
    this.toastService.success('Privacy settings updated');
  }

  saveAppearanceSettings(): void {
    console.log('Appearance settings saved:', this.settings.appearance);
    this.applyAppearanceSettings();
    this.toastService.success('Appearance settings applied');
  }

  // Save all settings
  saveAllSettings(): void {
    this.saveGeneralSettings();
    this.saveAccountSettings();
    this.saveNotificationSettings();
    this.savePrivacySettings();
    this.saveAppearanceSettings();
    this.toastService.success('All settings saved successfully!');
  }

  // Apply functions - these actually change the behavior
  applyGeneralSettings(): void {
    console.log('Applying general settings...');
    // Apply language
    document.documentElement.lang = this.settings.general.language;
    
    // Apply timezone (in a real app, you'd send this to backend)
    localStorage.setItem('timezone', this.settings.general.timezone);
    
    // Apply date format
    localStorage.setItem('dateFormat', this.settings.general.dateFormat);
  }

  updateUserProfile(): void {
    console.log('Updating user profile...');
    // In a real app, you'd make an API call here
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
  }

  applyNotificationSettings(): void {
    console.log('Applying notification settings...');
    // Store notification preferences
    localStorage.setItem('notifications', JSON.stringify(this.settings.notifications));
    
    // In a real app, you'd register/deregister push notifications
    if (this.settings.notifications.pushNotifications) {
      console.log('Push notifications enabled');
    } else {
      console.log('Push notifications disabled');
    }
  }

  applyPrivacySettings(): void {
    console.log('Applying privacy settings...');
    localStorage.setItem('privacy', JSON.stringify(this.settings.privacy));
  }

  applyAppearanceSettings(): void {
    console.log('Applying appearance settings...');
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', this.settings.appearance.theme);
    
    // Apply font size
    document.documentElement.style.fontSize = this.getFontSizeValue(this.settings.appearance.fontSize);
    
    // Apply direction
    document.documentElement.dir = this.settings.appearance.direction;
    document.documentElement.style.direction = this.settings.appearance.direction;
    
    // Store in localStorage
    localStorage.setItem('appearance', JSON.stringify(this.settings.appearance));
  }

  getFontSizeValue(size: string): string {
    switch(size) {
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  }

  // Password functions
  changePassword(): void {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      console.log('Password changed to:', newPassword);
      this.toastService.success('Password changed successfully');
    }
  }

  resetPassword(): void {
    const confirmReset = confirm('Are you sure you want to reset your password?');
    if (confirmReset) {
      console.log('Password reset initiated');
      this.toastService.info('Password reset instructions sent to your email');
    }
  }

  // Navigate back to patients
  backToPatients(): void {
    window.history.back();
  }

  // Initialize settings from localStorage
  ngOnInit(): void {
    this.loadSavedSettings();
  }

  loadSavedSettings(): void {
    // Load appearance settings
    const savedAppearance = localStorage.getItem('appearance');
    if (savedAppearance) {
      this.settings.appearance = { ...this.settings.appearance, ...JSON.parse(savedAppearance) };
      this.applyAppearanceSettings(); // Apply immediately
    }

    // Load other settings
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.settings.notifications = { ...this.settings.notifications, ...JSON.parse(savedNotifications) };
    }

    const savedPrivacy = localStorage.getItem('privacy');
    if (savedPrivacy) {
      this.settings.privacy = { ...this.settings.privacy, ...JSON.parse(savedPrivacy) };
    }
  }
}