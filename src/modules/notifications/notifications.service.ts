import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const saved = await this.notificationRepository.save(notification);

    // Emit real-time notification via WebSocket
    this.notificationsGateway.sendNotificationToUser(saved.userId, saved);

    return saved;
  }

  async createBulk(createNotificationDtos: CreateNotificationDto[]): Promise<Notification[]> {
    const notifications = this.notificationRepository.create(createNotificationDtos);
    const saved = await this.notificationRepository.save(notifications);

    // Emit real-time notifications via WebSocket
    saved.forEach((notification) => {
      this.notificationsGateway.sendNotificationToUser(notification.userId, notification);
    });

    return saved;
  }

  async findAll(userId: string, query: QueryNotificationDto) {
    const { type, priority, category, read, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Notification> = {
      userId,
    };

    if (type !== undefined) where.type = type;
    if (priority !== undefined) where.priority = priority;
    if (category !== undefined) where.category = category;
    if (read !== undefined) where.read = read;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);

    if (updateNotificationDto.read !== undefined && updateNotificationDto.read !== notification.read) {
      notification.read = updateNotificationDto.read;
      notification.readAt = updateNotificationDto.read ? new Date() : null;
    }

    return this.notificationRepository.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return this.update(id, userId, { read: true });
  }

  async markAsUnread(id: string, userId: string): Promise<Notification> {
    return this.update(id, userId, { read: false });
  }

  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }

  async removeAll(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({ userId });
    return { affected: result.affected || 0 };
  }

  async removeReadNotifications(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({ userId, read: true });
    return { affected: result.affected || 0 };
  }

  // Clean up expired notifications (to be called by cron job)
  async cleanupExpired(): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return { affected: result.affected || 0 };
  }

  // Helper methods for creating specific notification types
  async notifyInventoryLow(userId: string, productName: string, currentStock: number, minStock: number) {
    return this.create({
      userId,
      title: 'Stock Bajo',
      message: `El producto "${productName}" tiene un stock bajo: ${currentStock} unidades (mínimo: ${minStock})`,
      type: 'warning' as any,
      priority: 'high' as any,
      category: 'inventory' as any,
      metadata: { productName, currentStock, minStock },
    });
  }

  async notifyPurchaseOrderCreated(userId: string, orderId: string, supplierName: string) {
    return this.create({
      userId,
      title: 'Nueva Orden de Compra',
      message: `Se ha creado una nueva orden de compra para ${supplierName}`,
      type: 'success' as any,
      priority: 'medium' as any,
      category: 'purchase_order' as any,
      metadata: { orderId, supplierName },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }

  async notifyPaymentDue(userId: string, orderId: string, amount: number, dueDate: Date) {
    return this.create({
      userId,
      title: 'Pago Pendiente',
      message: `Tienes un pago pendiente de $${amount.toFixed(2)} con vencimiento ${dueDate.toLocaleDateString()}`,
      type: 'warning' as any,
      priority: 'high' as any,
      category: 'payment' as any,
      metadata: { orderId, amount, dueDate },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Detalles',
    });
  }
}
