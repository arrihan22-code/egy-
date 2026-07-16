import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private prisma: PrismaService) {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async send(params: {
    userId: string;
    type?: string;
    title: string;
    body?: string;
    metadata?: Record<string, unknown>;
    channel?: string;
  }) {
    const { userId, type = 'info', title, body, metadata, channel = 'in_app' } = params;

    const notification = await this.prisma.notification.create({
      data: { userId, type, title, body, channel, metadata: metadata || undefined },
    });

    await this.prisma.notificationLog.create({
      data: { notificationId: notification.id, channel, status: 'sent', sentAt: new Date() },
    });

    if (channel === 'email' && this.transporter) {
      await this.sendEmail(userId, title, body).catch(e =>
        this.logger.warn(`Email send failed for user ${userId}: ${e.message}`)
      );
    }

    return { success: true, data: notification };
  }

  async list(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [records, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      success: true,
      data: records,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), unread },
    };
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundException('Notification not found');

    if (notification.userId !== userId) throw new Error('Cannot mark another user\'s notification as read');

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true, data: updated };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  async getPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { userId, push: true, email: false, sms: false },
      });
    }
    return { success: true, data: prefs };
  }

  async updatePreferences(userId: string, params: { push?: boolean; email?: boolean; sms?: boolean }) {
    const prefs = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, push: params.push ?? true, email: params.email ?? false, sms: params.sms ?? false },
      update: { ...(params.push !== undefined && { push: params.push }), ...(params.email !== undefined && { email: params.email }), ...(params.sms !== undefined && { sms: params.sms }) },
    });

    return { success: true, data: prefs };
  }

  async broadcast(params: {
    type?: string;
    title: string;
    body?: string;
    metadata?: Record<string, unknown>;
    channel?: string;
    userIds?: string[];
  }) {
    const { type = 'info', title, body, metadata, channel = 'in_app', userIds } = params;

    const users = userIds
      ? await this.prisma.user.findMany({ where: { id: { in: userIds }, isVerified: true } })
      : await this.prisma.user.findMany({ where: { isVerified: true } });

    const notifications = await Promise.all(
      users.map(user =>
        this.prisma.notification.create({
          data: { userId: user.id, type, title, body, channel, metadata: metadata || undefined },
        })
      )
    );

    await this.prisma.notificationLog.createMany({
      data: notifications.map(n => ({ notificationId: n.id, channel, status: 'sent', sentAt: new Date() })),
    });

    return { success: true, data: { totalSent: notifications.length } };
  }

  async getStats(days = 7) {
    const result = await this.prisma.$queryRaw`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = true) as read_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE channel = 'in_app') as in_app_count,
        COUNT(*) FILTER (WHERE channel = 'email') as email_count,
        COUNT(*) FILTER (WHERE channel = 'sms') as sms_count
      FROM notifications
      WHERE created_at > NOW() - INTERVAL '${days} days'
    `;

    const byType = await this.prisma.$queryRaw`
      SELECT type, COUNT(*) as count
      FROM notifications
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY type
      ORDER BY count DESC
    `;

    return { success: true, data: { summary: result[0], byType } };
  }

  private async sendEmail(userId: string, subject: string, body?: string) {
    if (!this.transporter) return;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return;
    await this.transporter.sendMail({
      to: user.email,
      subject,
      text: body || subject,
      html: body ? `<p>${body}</p>` : undefined,
    });
  }
}
