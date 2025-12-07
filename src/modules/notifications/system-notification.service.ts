import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SystemNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyUserCreated(userId: string, newUserName: string, role: string) {
    return this.notificationsService.create({
      userId,
      title: '👤 Nuevo Usuario Creado',
      message: `Se creó el usuario "${newUserName}" con rol de ${role}`,
      type: 'info' as any,
      priority: 'low' as any,
      category: 'user' as any,
      metadata: { newUserName, role },
      actionUrl: '/users',
      actionLabel: 'Ver Usuarios',
    });
  }

  async notifyReportGenerated(userId: string, reportType: string, reportName: string) {
    return this.notificationsService.create({
      userId,
      title: '📊 Reporte Generado',
      message: `Se generó exitosamente el reporte: ${reportName}`,
      type: 'success' as any,
      priority: 'low' as any,
      category: 'report' as any,
      metadata: { reportType, reportName },
      actionUrl: '/reports',
      actionLabel: 'Ver Reporte',
    });
  }

  async notifySystemMaintenance(userIds: string[], startDate: Date, endDate: Date, description: string) {
    const notifications = userIds.map(userId => ({
      userId,
      title: '🔧 Mantenimiento del Sistema',
      message: `Se realizará mantenimiento del sistema desde ${startDate.toLocaleString()} hasta ${endDate.toLocaleString()}. ${description}`,
      type: 'warning' as any,
      priority: 'high' as any,
      category: 'system' as any,
      metadata: { startDate, endDate, description },
    }));

    return this.notificationsService.createBulk(notifications);
  }

  async notifyBackupCompleted(userId: string, backupSize: string) {
    return this.notificationsService.create({
      userId,
      title: '💾 Respaldo Completado',
      message: `Se completó exitosamente el respaldo del sistema (${backupSize})`,
      type: 'success' as any,
      priority: 'low' as any,
      category: 'system' as any,
      metadata: { backupSize },
    });
  }

  async notifySecurityAlert(userIds: string[], alertType: string, description: string) {
    const notifications = userIds.map(userId => ({
      userId,
      title: '🔒 Alerta de Seguridad',
      message: `${alertType}: ${description}`,
      type: 'error' as any,
      priority: 'urgent' as any,
      category: 'system' as any,
      metadata: { alertType, description },
    }));

    return this.notificationsService.createBulk(notifications);
  }
}
