import { Module } from '@nestjs/common'
import { ProductsModule } from '../products/products.module'
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module'
import { InvoiceImportController } from './invoice-import.controller'
import { InvoiceImportService } from './invoice-import.service'

@Module({
  imports: [ProductsModule, PurchaseOrdersModule],
  controllers: [InvoiceImportController],
  providers: [InvoiceImportService],
})
export class InvoiceImportModule {}
