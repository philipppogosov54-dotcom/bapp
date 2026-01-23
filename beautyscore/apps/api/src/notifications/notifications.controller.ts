import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import type { NotificationSettings } from './notifications.service';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Notifications Controller
 *
 * User notifications and settings
 *
 * Endpoints:
 * - GET /api/notifications - Get notifications
 * - PUT /api/notifications/:id/read - Mark as read
 * - PUT /api/notifications/read-all - Mark all as read
 * - GET /api/settings/notifications - Get settings
 * - PUT /api/settings/notifications - Update settings
 */
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications
   * Get user notifications
   */
  @Get('notifications')
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const notifications = await this.notificationsService.getNotifications(
      userId,
      unreadOnly === 'true',
    );
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    return { notifications, unreadCount };
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark notification as read
   */
  @Put('notifications/:id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.notificationsService.markAsRead(userId, id);
    return { message: 'Прочитано' };
  }

  /**
   * PUT /api/notifications/read-all
   * Mark all notifications as read
   */
  @Put('notifications/read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    const result = await this.notificationsService.markAllAsRead(userId);
    return { message: `${result.count} уведомлений помечены прочитанными` };
  }

  /**
   * GET /api/settings/notifications
   * Get notification settings
   */
  @Get('settings/notifications')
  async getSettings(@CurrentUser('id') userId: string) {
    return this.notificationsService.getSettings(userId);
  }

  /**
   * PUT /api/settings/notifications
   * Update notification settings
   */
  @Put('settings/notifications')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() settings: Partial<NotificationSettings>,
  ) {
    return this.notificationsService.updateSettings(userId, settings);
  }
}
