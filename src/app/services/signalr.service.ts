import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationDetailsDto } from '../models/notification.model';

export interface RealTimeUpdate {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private readonly API_BASE_URL_HTTP = 'http://localhost:5262';
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  // Subjects for different types of real-time updates
  private notificationSubject = new Subject<NotificationDetailsDto>();
  public notification$ = this.notificationSubject.asObservable();

  private updateSubject = new Subject<RealTimeUpdate>();
  public update$ = this.updateSubject.asObservable();

  constructor(private authService: AuthService) {
    // Don't initialize immediately - wait for authentication
    // The app component will call connect() when user is authenticated
  }

  private async initializeConnection(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('SignalR: No token available, cannot establish connection');
      return;
    }

    // Build the connection URL with token in query string for CORS compatibility
    const hubUrl = `${this.API_BASE_URL_HTTP}/notificationhub?access_token=${encodeURIComponent(token)}`;
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        withCredentials: false // Don't use withCredentials when token is in query string
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            // If we've been reconnecting for less than 60 seconds, wait 2 seconds
            return 2000;
          } else {
            // Otherwise, wait 10 seconds
            return 10000;
          }
        }
      })
      .build();

    this.setupHandlers();

    try {
      await this.startConnection();
    } catch (error) {
      console.error('SignalR: Error starting connection', error);
      this.connectionStatusSubject.next(false);
    }
  }

  private setupHandlers(): void {
    if (!this.hubConnection) return;

    // Handle notification received (actual notifications from database)
    this.hubConnection.on('ReceiveNotification', (notification: any) => {
      console.log('🔔 SignalR: Notification received from server', notification);
      
      // Ensure notification is properly formatted
      const formattedNotification: NotificationDetailsDto = {
        notificationId: notification.notificationId || notification.notification_id || 0,
        message: notification.message || notification.Message || '',
        isRead: notification.isRead || notification.is_read || false,
        createDate: notification.createDate || notification.create_date || notification.CreateDate || new Date().toISOString(),
        readDate: notification.readDate || notification.read_date || notification.ReadDate || null,
        senderUserId: notification.senderUserId || notification.sender_user_id || notification.SenderUserId || 0,
        senderName: notification.senderName || notification.SenderName || 'System',
        senderEmail: notification.senderEmail || notification.SenderEmail || '',
        receiverUserId: notification.receiverUserId || notification.receiver_user_id || notification.ReceiverUserId || 0,
        receiverName: notification.receiverName || notification.ReceiverName || '',
        receiverEmail: notification.receiverEmail || notification.ReceiverEmail || ''
      };
      
      console.log('📨 Formatted notification:', formattedNotification);
      this.notificationSubject.next(formattedNotification);
    });

    // Handle real-time updates
    this.hubConnection.on('ReceiveUpdate', (update: any) => {
      console.log('🔄 SignalR: Update received', update);
      // Ensure update has proper structure (handle both camelCase and PascalCase from backend)
      const formattedUpdate: RealTimeUpdate = {
        type: update.type || update.Type || '',
        data: update.data || update.Data || update,
        timestamp: update.timestamp || update.Timestamp || new Date()
      };
      this.updateSubject.next(formattedUpdate);
    });

    // Handle connection events
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR: Reconnecting...');
      this.connectionStatusSubject.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR: Reconnected');
      this.connectionStatusSubject.next(true);
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR: Connection closed', error);
      this.connectionStatusSubject.next(false);
      
      // Try to reconnect if we have a token
      if (this.authService.isAuthenticated()) {
        setTimeout(() => this.initializeConnection(), 3000);
      }
    });
  }

  private async startConnection(): Promise<void> {
    if (!this.hubConnection) {
      await this.initializeConnection();
      return;
    }

    if (this.hubConnection.state === HubConnectionState.Connected) {
      console.log('SignalR: Already connected');
      return;
    }

    try {
      await this.hubConnection.start();
      console.log('✅ SignalR: Connection established successfully');
      this.connectionStatusSubject.next(true);
      
      // Log connection details for debugging
      console.log('SignalR: Connection state:', this.hubConnection.state);
      console.log('SignalR: Connection ID:', this.hubConnection.connectionId);
    } catch (error: any) {
      console.error('❌ SignalR: Error starting connection', error);
      console.error('SignalR: Error details:', {
        message: error.message,
        stack: error.stack
      });
      this.connectionStatusSubject.next(false);
      throw error;
    }
  }

  public async connect(): Promise<void> {
    console.log('SignalR: Attempting to connect...');
    const token = this.authService.getToken();
    if (!token) {
      console.warn('SignalR: No token available');
      return;
    }
    await this.initializeConnection();
  }

  public async disconnect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      await this.hubConnection.stop();
      this.connectionStatusSubject.next(false);
      console.log('SignalR: Connection stopped');
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  // Reconnect when token changes (e.g., after login)
  public async reconnect(): Promise<void> {
    await this.disconnect();
    await this.initializeConnection();
  }
}

