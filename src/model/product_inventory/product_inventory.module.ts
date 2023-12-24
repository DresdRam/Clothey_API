import { Module } from '@nestjs/common';
import { ProductInventoryService } from './product_inventory.service';
import { ProductInventoryController } from './product_inventory.controller';

@Module({
  providers: [ProductInventoryService],
  controllers: [ProductInventoryController]
})
export class ProductInventoryModule {}
