import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InventoryNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async notifyLowStock(userId: string, productName: string, currentStock: number, minStock: number, warehouseName?: string) {
    const location = warehouseName ? ` en ${warehouseName}` : '';
    return this.notificationsService.create({
      userId,
      title: '⚠️ Stock Bajo Detectado',
      message: `El producto "${productName}" tiene un stock crítico${location}: ${currentStock} unidades (mínimo recomendado: ${minStock})`,
      type: 'warning' as any,
      priority: currentStock === 0 ? 'urgent' as any : 'high' as any,
      category: 'inventory' as any,
      metadata: { productName, currentStock, minStock, warehouseName },
      actionUrl: '/inventory',
      actionLabel: 'Ver Inventario',
    });
  }

  async notifyStockUpdate(userId: string, productName: string, oldStock: number, newStock: number, warehouseName?: string) {
    const change = newStock - oldStock;
    const changeType = change > 0 ? 'incrementó' : 'decrementó';
    const location = warehouseName ? ` en ${warehouseName}` : '';
    
    return this.notificationsService.create({
      userId,
      title: '📦 Actualización de Stock',
      message: `El stock de "${productName}"${location} se ${changeType} en ${Math.abs(change)} unidades (${oldStock} → ${newStock})`,
      type: 'info' as any,
      priority: 'low' as any,
      category: 'inventory' as any,
      metadata: { productName, oldStock, newStock, change, warehouseName },
      actionUrl: '/inventory',
      actionLabel: 'Ver Detalles',
    });
  }

  async notifyStockAdded(userId: string, productName: string, quantity: number, warehouseName?: string) {
    const location = warehouseName ? ` a ${warehouseName}` : '';
    
    return this.notificationsService.create({
      userId,
      title: '✅ Stock Agregado',
      message: `Se agregaron ${quantity} unidades de "${productName}"${location}`,
      type: 'success' as any,
      priority: 'medium' as any,
      category: 'inventory' as any,
      metadata: { productName, quantity, warehouseName },
      actionUrl: '/inventory',
      actionLabel: 'Ver Inventario',
    });
  }

  async notifyStockTransfer(userId: string, productName: string, quantity: number, fromWarehouse: string, toWarehouse: string) {
    return this.notificationsService.create({
      userId,
      title: '🔄 Transferencia de Stock',
      message: `Se transfirieron ${quantity} unidades de "${productName}" desde ${fromWarehouse} hacia ${toWarehouse}`,
      type: 'info' as any,
      priority: 'medium' as any,
      category: 'inventory' as any,
      metadata: { productName, quantity, fromWarehouse, toWarehouse },
      actionUrl: '/inventory',
      actionLabel: 'Ver Movimientos',
    });
  }

  async notifyStockAdjustment(userId: string, productName: string, adjustment: number, reason: string, warehouseName?: string) {
    const location = warehouseName ? ` en ${warehouseName}` : '';
    const adjustmentType = adjustment > 0 ? 'Incremento' : 'Decremento';
    
    return this.notificationsService.create({
      userId,
      title: `📊 Ajuste de Inventario`,
      message: `${adjustmentType} de ${Math.abs(adjustment)} unidades de "${productName}"${location}. Razón: ${reason}`,
      type: 'warning' as any,
      priority: 'medium' as any,
      category: 'inventory' as any,
      metadata: { productName, adjustment, reason, warehouseName },
      actionUrl: '/inventory',
      actionLabel: 'Ver Detalles',
    });
  }
}
