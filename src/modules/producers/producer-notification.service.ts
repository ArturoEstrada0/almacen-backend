import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProducerNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyReceptionCreated(userId: string, receptionId: string, producerName: string, totalWeight: number) {
    return this.notificationsService.create({
      userId,
      title: '🚛 Nueva Recepción de Productor',
      message: `Se registró una recepción de ${producerName} con ${totalWeight} kg`,
      type: 'success' as any,
      priority: 'medium' as any,
      category: 'producer' as any,
      metadata: { receptionId, producerName, totalWeight },
      actionUrl: `/producers/${receptionId}`,
      actionLabel: 'Ver Recepción',
    });
  }

  async notifyQualityIssue(userId: string, producerName: string, issueDescription: string) {
    return this.notificationsService.create({
      userId,
      title: '⚠️ Problema de Calidad',
      message: `Se detectó un problema de calidad con productos de ${producerName}: ${issueDescription}`,
      type: 'warning' as any,
      priority: 'high' as any,
      category: 'producer' as any,
      metadata: { producerName, issueDescription },
      actionUrl: '/producers',
      actionLabel: 'Ver Detalles',
    });
  }

  async notifyProducerPaymentDue(userId: string, producerName: string, amount: number, dueDate: Date) {
    return this.notificationsService.create({
      userId,
      title: '💵 Pago a Productor Pendiente',
      message: `Pago pendiente de $${amount.toFixed(2)} para ${producerName} con vencimiento el ${dueDate.toLocaleDateString()}`,
      type: 'info' as any,
      priority: 'medium' as any,
      category: 'producer' as any,
      metadata: { producerName, amount, dueDate },
      actionUrl: '/producers',
      actionLabel: 'Ver Pagos',
    });
  }
}
