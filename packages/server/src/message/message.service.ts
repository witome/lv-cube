import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, type: string, title: string, content: string, relatedId?: number) {
    return this.prisma.message.create({
      data: {
        userId,
        type,
        title,
        content,
        relatedId,
      },
    });
  }

  async findByUser(userId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [list, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where: { userId } }),
    ]);
    return { list, total, page, pageSize };
  }

  async getUnreadCount(userId: number) {
    return this.prisma.message.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: number, messageId: number) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new BadRequestException('消息不存在');
    if (message.userId !== userId) throw new BadRequestException('无权操作');
    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: number) {
    return this.prisma.message.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
