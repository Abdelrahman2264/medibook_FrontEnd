import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { SignalRService } from '../../services/signalr.service';
import { Notification, NotificationDetailsDto } from '../../models/notification.model';
import { interval, Subscription } from 'rxjs';
import { mapNotificationDetailsDtoToNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  isOpen: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  private refreshSubscription?: Subscription;
  private signalRSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

  constructor(
    private notificationsService: NotificationsService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
    
    // Subscribe to real-time notifications from SignalR
    this.signalRSubscription = this.signalRService.notification$.subscribe(notification => {
      console.log('🔔 NotificationsComponent: Real-time notification received', notification);
      
      // Convert NotificationDetailsDto to Notification
      const notificationModel = mapNotificationDetailsDtoToNotification(notification);
      
      // Add to the beginning of the list if not already present
      const existingIndex = this.notifications.findIndex(n => n.notificationId === notificationModel.notificationId);
      if (existingIndex === -1) {
        this.notifications.unshift(notificationModel);
        if (!notificationModel.isRead) {
          this.unreadCount++;
          console.log('📊 Unread count updated:', this.unreadCount);
        }
        this.cdr.detectChanges();
        console.log('✅ Notification added to list. Total:', this.notifications.length);
      } else {
        console.log('⚠️ Notification already exists, skipping');
      }
    });
    
    // Set up auto-refresh (less frequent now that we have real-time updates)
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.loadUnreadCount();
      if (this.isOpen) {
        this.loadNotifications();
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
  }

  toggleNotifications() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  closeNotifications() {
    this.isOpen = false;
  }

  loadNotifications() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.notificationsService.getCurrentUserNotifications().subscribe({
      next: (notifications) => {
        // Sort by createDate descending (newest first)
        this.notifications = notifications.sort((a, b) => 
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.errorMessage = 'Failed to load notifications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUnreadCount() {
    this.notificationsService.getCurrentUserUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      }
    });
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) {
      return;
    }

    this.notificationsService.markNotificationAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;
        notification.readDate = new Date();
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        this.errorMessage = 'Failed to mark notification as read.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  markAllAsRead() {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationsService.markAllNotificationsAsRead().subscribe({
      next: () => {
        // Update all notifications to read
        this.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readDate = new Date();
          }
        });
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.errorMessage = 'Failed to mark all notifications as read.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  getReadNotifications(): Notification[] {
    return this.notifications.filter(n => n.isRead);
  }
}

