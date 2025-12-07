import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchaseOrderNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyOrderCreated(userId: string, orderId: string, supplierName: string, totalAmount: number) {
    return this.notificationsService.create({
      userId,
      title: '🛒 Nueva Orden de Compra',
      message: `Se creó la orden #${orderId} para ${supplierName} por $${totalAmount.toFixed(2)}`,
      type: 'success' as any,
      priority: 'medium' as any,
      category: 'purchase_order' as any,
      metadata: { orderId, supplierName, totalAmount },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }

  async notifyOrderApproved(userId: string, orderId: string, approvedBy: string) {
    return this.notificationsService.create({
      userId,
      title: '✅ Orden Aprobada',
      message: `La orden #${orderId} fue aprobada por ${approvedBy}`,
      type: 'success' as any,
      priority: 'high' as any,
      category: 'purchase_order' as any,
      metadata: { orderId, approvedBy },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }

  async notifyOrderRejected(userId: string, orderId: string, reason: string) {
    return this.notificationsService.create({
      userId,
      title: '❌ Orden Rechazada',
      message: `La orden #${orderId} fue rechazada. Razón: ${reason}`,
      type: 'error' as any,
      priority: 'high' as any,
      category: 'purchase_order' as any,
      metadata: { orderId, reason },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }

  async notifyOrderDelivered(userId: string, orderId: string, supplierName: string) {
    return this.notificationsService.create({
      userId,
      title: '📦 Orden Entregada',
      message: `La orden #${orderId} de ${supplierName} ha sido entregada`,
      type: 'success' as any,
      priority: 'medium' as any,
      category: 'purchase_order' as any,
      metadata: { orderId, supplierName },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }

  async notifyPaymentDue(userId: string, orderId: string, supplierName: string, amount: number, dueDate: Date) {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const urgency = daysUntilDue <= 3 ? 'urgent' : daysUntilDue <= 7 ? 'high' : 'medium';
    
    return this.notificationsService.create({
      userId,
      title: '💰 Pago Próximo a Vencer',
      message: `Pago pendiente de $${amount.toFixed(2)} para ${supplierName} (Orden #${orderId}) vence en ${daysUntilDue} día(s)`,
      type: 'warning' as any,
      priority: urgency as any,
      category: 'payment' as any,
      metadata: { orderId, supplierName, amount, dueDate, daysUntilDue },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Pago',
    });
  }

  async notifyPaymentOverdue(userId: string, orderId: string, supplierName: string, amount: number, daysOverdue: number) {
    return this.notificationsService.create({
      userId,
      title: '🚨 Pago Vencido',
      message: `URGENTE: Pago vencido de $${amount.toFixed(2)} para ${supplierName} (Orden #${orderId}). Vencido hace ${daysOverdue} día(s)`,
      type: 'error' as any,
      priority: 'urgent' as any,
      category: 'payment' as any,
      metadata: { orderId, supplierName, amount, daysOverdue },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Pagar Ahora',
    });
  }

  async notifyPaymentCompleted(userId: string, orderId: string, supplierName: string, amount: number) {
    return this.notificationsService.create({
      userId,
      title: '✅ Pago Completado',
      message: `Se registró el pago de $${amount.toFixed(2)} para ${supplierName} (Orden #${orderId})`,
      type: 'success' as any,
      priority: 'low' as any,
      category: 'payment' as any,
      metadata: { orderId, supplierName, amount },
      actionUrl: `/purchase-orders/${orderId}`,
      actionLabel: 'Ver Orden',
    });
  }
}
