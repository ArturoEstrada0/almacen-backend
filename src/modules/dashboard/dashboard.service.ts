import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Shipment } from '../producers/entities/shipment.entity';
import { FruitReception } from '../producers/entities/fruit-reception.entity';
import { InputAssignment } from '../producers/entities/input-assignment.entity';
import { InputAssignmentItem } from '../producers/entities/input-assignment-item.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectRepository(Shipment)
    private shipmentsRepository: Repository<Shipment>,
    @InjectRepository(FruitReception)
    private fruitReceptionsRepository: Repository<FruitReception>,
    @InjectRepository(InputAssignment)
    private inputAssignmentsRepository: Repository<InputAssignment>,
    @InjectRepository(InputAssignmentItem)
    private inputAssignmentItemsRepository: Repository<InputAssignmentItem>,
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

  async getProfitReport() {
    try {
      // 1. COSTOS: Órdenes de compra completadas (insumos comprados)
      const purchaseOrders = await this.purchaseOrdersRepository.find({
        where: { status: 'completada' },
        relations: ['items', 'items.product'],
      });

      const totalPurchaseCost = purchaseOrders.reduce((sum, order) => {
        return sum + Number(order.total || 0);
      }, 0);

      // 2. COSTOS: Asignaciones de insumos a productores (costo de insumos entregados)
      const inputAssignments = await this.inputAssignmentsRepository.find({
        relations: ['items', 'items.product', 'producer'],
      });

      const totalInputAssignmentsCost = inputAssignments.reduce((sum, assignment) => {
        return sum + Number(assignment.total || 0);
      }, 0);

      const inputAssignmentsByProduct = await this.inputAssignmentItemsRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.product', 'product')
        .leftJoinAndSelect('item.assignment', 'assignment')
        .select([
          'product.id as productId',
          'product.name as productName',
          'SUM(item.quantity) as totalQuantity',
          'SUM(item.total) as totalCost',
        ])
        .groupBy('product.id')
        .addGroupBy('product.name')
        .getRawMany();

      // 3. INGRESOS: Embarques vendidos (ventas de fruta)
      const shipments = await this.shipmentsRepository.find({
        where: { status: 'vendida' },
        relations: ['receptions', 'receptions.product', 'receptions.producer'],
      });

      const totalSalesRevenue = shipments.reduce((sum, shipment) => {
        return sum + Number(shipment.totalSale || 0);
      }, 0);

      const totalBoxesShipped = shipments.reduce((sum, shipment) => {
        return sum + Number(shipment.totalBoxes || 0);
      }, 0);

      // Desglose de ventas por embarque
      const shipmentsSummary = shipments.map(shipment => ({
        code: shipment.code,
        date: shipment.date,
        boxes: Number(shipment.totalBoxes || 0),
        pricePerBox: shipment.salePricePerBox ? Number(shipment.salePricePerBox) : 0,
        totalSale: shipment.totalSale ? Number(shipment.totalSale) : 0,
        status: shipment.status,
      }));

      // 4. Recepciones de fruta (para contexto)
      const fruitReceptions = await this.fruitReceptionsRepository.find({
        relations: ['product', 'producer'],
      });

      const totalBoxesReceived = fruitReceptions.reduce((sum, reception) => {
        return sum + Number(reception.boxes || 0);
      }, 0);

      // 5. CÁLCULO DE UTILIDADES
      const totalCosts = totalInputAssignmentsCost; // Costo real de insumos entregados
      const totalRevenue = totalSalesRevenue; // Ingresos por ventas
      const grossProfit = totalRevenue - totalCosts;
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // 6. Métricas adicionales
      const averagePricePerBox = totalBoxesShipped > 0 ? totalRevenue / totalBoxesShipped : 0;
      const costPerBox = totalBoxesReceived > 0 ? totalCosts / totalBoxesReceived : 0;
      const profitPerBox = averagePricePerBox - costPerBox;

      return {
        summary: {
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalCosts: Number(totalCosts.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(2)),
          profitMargin: Number(profitMargin.toFixed(2)),
        },
        costs: {
          totalPurchaseOrders: Number(totalPurchaseCost.toFixed(2)),
          totalInputAssignments: Number(totalInputAssignmentsCost.toFixed(2)),
          inputAssignmentsByProduct: inputAssignmentsByProduct.map(item => ({
            productId: item.productId,
            productName: item.productName,
            totalQuantity: Number(item.totalQuantity),
            totalCost: Number(Number(item.totalCost).toFixed(2)),
          })),
        },
        revenue: {
          totalSales: Number(totalSalesRevenue.toFixed(2)),
          totalBoxesShipped: Number(totalBoxesShipped),
          averagePricePerBox: Number(averagePricePerBox.toFixed(2)),
          shipments: shipmentsSummary,
        },
        operations: {
          totalBoxesReceived: Number(totalBoxesReceived),
          totalBoxesShipped: Number(totalBoxesShipped),
          boxesInProcess: Number(totalBoxesReceived - totalBoxesShipped),
          costPerBox: Number(costPerBox.toFixed(2)),
          profitPerBox: Number(profitPerBox.toFixed(2)),
        },
        counts: {
          purchaseOrders: purchaseOrders.length,
          inputAssignments: inputAssignments.length,
          fruitReceptions: fruitReceptions.length,
          shipmentsSold: shipments.length,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating profit report:', error);
      throw error;
    }
  }
}
