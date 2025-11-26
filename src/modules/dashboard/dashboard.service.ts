import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  async getKPIs() {
    try {
      // Get total products
      const totalProducts = await this.productsRepository.count();

      // Get low stock count - for now return 0 as we need inventory module
      const lowStockCount = 0;

      // Get pending purchase orders
      const pendingOrders = await this.purchaseOrdersRepository.count({
        where: { status: 'pendiente' }
      });

      // Get active suppliers
      const activeSuppliers = await this.suppliersRepository.count({
        where: { active: true }
      });

      // Get total inventory value - for now return 0 as we need inventory module
      const totalInventoryValue = 0;

      return {
        totalProducts,
        lowStockCount,
        pendingOrders,
        activeSuppliers,
        totalInventoryValue,
      };
    } catch (error) {
      console.error('Error getting KPIs:', error);
      // Return default values in case of error
      return {
        totalProducts: 0,
        lowStockCount: 0,
        pendingOrders: 0,
        activeSuppliers: 0,
        totalInventoryValue: 0,
      };
    }
  }
}
