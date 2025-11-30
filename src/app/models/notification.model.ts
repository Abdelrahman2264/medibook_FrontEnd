// src/app/models/notification.model.ts

export interface NotificationDetailsDto {
  notificationId: number;
  message: string;
  isRead: boolean;
  createDate: string;
  readDate: string | null;
  senderUserId: number;
  senderName: string;
  senderEmail: string;
  receiverUserId: number;
  receiverName: string;
  receiverEmail: string;
}

export interface Notification {
  notificationId: number;
  message: string;
  isRead: boolean;
  createDate: Date;
  readDate: Date | null;
  senderUserId: number;
  senderName: string;
  senderEmail: string;
  receiverUserId: number;
  receiverName: string;
  receiverEmail: string;
}

// Mapping function from NotificationDetailsDto to Notification
export function mapNotificationDetailsDtoToNotification(dto: NotificationDetailsDto): Notification {
  return {
    notificationId: dto.notificationId,
    message: dto.message,
    isRead: dto.isRead,
    createDate: new Date(dto.createDate),
    readDate: dto.readDate ? new Date(dto.readDate) : null,
    senderUserId: dto.senderUserId,
    senderName: dto.senderName,
    senderEmail: dto.senderEmail,
    receiverUserId: dto.receiverUserId,
    receiverName: dto.receiverName,
    receiverEmail: dto.receiverEmail
  };
}

