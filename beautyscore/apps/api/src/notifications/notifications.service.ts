import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data: Prisma.JsonValue | null;
  createdAt: Date;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  marketingEnabled: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/notifications - Get user notifications
   */
  async getNotifications(userId: string, unreadOnly = false): Promise<NotificationItem[]> {
    const where: { userId: string; read?: boolean } = { userId };
    if (unreadOnly) where.read = false;

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        read: true,
        data: true,
        createdAt: true,
      },
    });

    return notifications;
  }

  /**
   * PUT /api/notifications/:id/read - Mark as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  /**
   * PUT /api/notifications/read-all - Mark all as read
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { count: result.count };
  }

  /**
   * GET /api/settings/notifications - Get notification settings
   */
  async getSettings(userId: string): Promise<NotificationSettings> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationsEnabled: true,
        marketingAcceptedAt: true,
      },
    });

    return {
      notificationsEnabled: user?.notificationsEnabled ?? true,
      marketingEnabled: !!user?.marketingAcceptedAt,
    };
  }

  /**
   * PUT /api/settings/notifications - Update notification settings
   */
  async updateSettings(
    userId: string,
    settings: Partial<NotificationSettings>,
  ): Promise<NotificationSettings> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationsEnabled: settings.notificationsEnabled,
        marketingAcceptedAt: settings.marketingEnabled ? new Date() : null,
      },
    });

    return this.getSettings(userId);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Create notification (internal use)
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Prisma.InputJsonValue,
  ): Promise<NotificationItem> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data,
      },
    });

    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      read: notification.read,
      data: notification.data,
      createdAt: notification.createdAt,
    };
  }
}
