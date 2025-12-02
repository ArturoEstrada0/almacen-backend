import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Product } from '../products/entities/product.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Shipment } from '../producers/entities/shipment.entity';
import { FruitReception } from '../producers/entities/fruit-reception.entity';
import { InputAssignment } from '../producers/entities/input-assignment.entity';
import { InputAssignmentItem } from '../producers/entities/input-assignment-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, 
      PurchaseOrder, 
      Supplier, 
      Shipment, 
      FruitReception, 
      InputAssignment,
      InputAssignmentItem,
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
