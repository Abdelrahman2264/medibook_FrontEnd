import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { NotificationDetailsDto, Notification, mapNotificationDetailsDtoToNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly API_BASE_URL = 'https://localhost:7281/api';
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262/api';
  
  private useHttps = false;
  
  private get baseUrl(): string {
    return this.useHttps ? this.API_BASE_URL : this.API_BASE_URL_HTTP;
  }

  constructor(private http: HttpClient) {}

  // Get all notifications for current user
  getCurrentUserNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationDetailsDto[]>(`${this.baseUrl}/Notifications/current-user`).pipe(
      map(dtos => dtos.map(dto => mapNotificationDetailsDtoToNotification(dto)))
    );
  }

  // Get unread notifications for current user
  getCurrentUserUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<NotificationDetailsDto[]>(`${this.baseUrl}/Notifications/current-user/unread`).pipe(
      map(dtos => dtos.map(dto => mapNotificationDetailsDtoToNotification(dto)))
    );
  }

  // Get unread notification count for current user
  getCurrentUserUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/Notifications/current-user/unread-count`).pipe(
      map(response => {
        // Handle different response formats
        if (typeof response === 'number') {
          return response;
        }
        if (response && typeof response === 'object') {
          return response.unreadCount || response.UnreadCount || 0;
        }
        return 0;
      })
    );
  }

  // Get notification by ID
  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<NotificationDetailsDto>(`${this.baseUrl}/Notifications/${id}`).pipe(
      map(dto => mapNotificationDetailsDtoToNotification(dto))
    );
  }

  // Mark notification as read
  markNotificationAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Notifications/${id}/mark-read`, {});
  }

  // Mark all notifications as read for current user
  markAllNotificationsAsRead(): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Notifications/current-user/mark-all-read`, {});
  }
}

